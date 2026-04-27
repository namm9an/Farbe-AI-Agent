import logging
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.lib.color import extract_palette, get_palette_confidence
from app.lib.compare import compare_palettes
from app.lib.db import save_analysis_run
from app.lib.llm import generate_suggestion_narrative
from app.models.analysis import AnalysisResult

router = APIRouter(prefix="/api", tags=["analysis"])
logger = logging.getLogger(__name__)


async def _read_upload(file: UploadFile) -> bytes:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded files must not be empty.")
    return content


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    reference: UploadFile | None = File(None),
    target: UploadFile | None = File(None),
) -> AnalysisResult | JSONResponse:
    try:
        if not reference or not target:
            return JSONResponse(
                status_code=400,
                content={"error": "Both reference and target images are required."},
            )

        reference_bytes = await _read_upload(reference)
        target_bytes = await _read_upload(target)

        reference_palette = extract_palette(reference_bytes)
        target_palette = extract_palette(target_bytes)

        confidence = round(
            (get_palette_confidence(reference_palette) + get_palette_confidence(target_palette)) / 2,
            2,
        )
        analysis_core = compare_palettes(reference_palette, target_palette, confidence)

        llm_narrative = generate_suggestion_narrative(
            reference_palette=[color.hex for color in reference_palette],
            target_palette=[color.hex for color in target_palette],
            score=analysis_core["colorMatchScore"],
            findings=analysis_core["findings"],
            suggestions=analysis_core["suggestions"],
        )

        created_at = datetime.now(timezone.utc).isoformat()
        suggestions = (
            [*analysis_core["suggestions"], llm_narrative]
            if llm_narrative
            else analysis_core["suggestions"]
        )

        result = AnalysisResult(
            referencePalette=reference_palette,
            targetPalette=target_palette,
            colorMatchScore=analysis_core["colorMatchScore"],
            findings=analysis_core["findings"],
            suggestions=suggestions,
            matches=analysis_core["matches"],
            confidence=analysis_core["confidence"],
            summary=llm_narrative or analysis_core["summary"],
            createdAt=created_at,
        )

        try:
            save_analysis_run(
                created_at=created_at,
                reference_name=reference.filename or "reference",
                target_name=target.filename or "target",
                match_score=result.colorMatchScore,
                confidence=result.confidence,
                findings=result.findings,
                suggestions=result.suggestions,
                summary=result.summary,
            )
        except Exception:
            logger.exception("Failed to persist analysis run; returning analysis result anyway.")

        return result
    except HTTPException as error:
        return JSONResponse(
            status_code=error.status_code,
            content={"error": str(error.detail)},
        )
    except Exception as error:
        logger.exception("Analysis request failed.")
        return JSONResponse(
            status_code=500,
            content={"error": "The analysis failed. Please try again with cleaner image assets."},
        )
