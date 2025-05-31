from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import json
import os
from typing import List, Dict, Optional
from functools import lru_cache
import logging
from fastapi.responses import JSONResponse

# Enhanced logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Debug middleware
@app.middleware("http")
async def debug_middleware(request: Request, call_next):
    logger.debug(f"Request headers: {request.headers}")
    logger.debug(f"Request method: {request.method}")
    logger.debug(f"Request URL: {request.url}")
    
    response = await call_next(request)
    
    logger.debug(f"Response status: {response.status_code}")
    logger.debug(f"Response headers: {response.headers}")
    
    return response

# Simplified CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

def clean_float_values(obj):
    if isinstance(obj, dict):
        return {k: clean_float_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_float_values(v) for v in obj]
    elif isinstance(obj, (float, np.float64)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    return obj

# Cache results for 5 minutes
@lru_cache(maxsize=32)
def load_results(db_type: Optional[str] = None):
    results = []
    results_dir = "../results"
    
    try:
        for file in os.listdir(results_dir):
            if file.endswith(".csv"):
                # Filter by database type if specified
                if db_type and db_type not in file:
                    continue
                    
                file_path = os.path.join(results_dir, file)
                logger.info(f"Processing file: {file_path}")
                
                try:
                    df = pd.read_csv(file_path)
                    # Convert DataFrame to dict and clean float values
                    data_dict = df.to_dict(orient="records")
                    cleaned_data = clean_float_values(data_dict)
                    
                    results.append({
                        "filename": file,
                        "database": file.split("_")[0],
                        "data": cleaned_data
                    })
                except Exception as e:
                    logger.error(f"Error processing file {file}: {str(e)}")
                    logger.exception(e)
                    
    except Exception as e:
        logger.error(f"Error accessing results directory: {str(e)}")
        raise HTTPException(status_code=500, detail="Error accessing results")
        
    return results

@app.get("/api/results")
async def get_results(db_type: Optional[str] = None):
    """
    Get benchmark results with optional database type filtering
    """
    try:
        logger.debug("Fetching results...")
        results = load_results(db_type)
        logger.debug(f"Found {len(results)} results")
        # Test JSON serialization before returning
        try:
            json.dumps(results)  # Test if results can be serialized
        except Exception as e:
            logger.error(f"JSON serialization error: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": "Data contains values that cannot be serialized to JSON"}
            )
            
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error getting results: {str(e)}")
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics")
async def get_metrics():
    return {
        "metrics": [
            "Throughput(ops/sec)",
            "AverageLatency(us)",
            "95thPercentileLatency(us)",
            "99thPercentileLatency(us)"
        ]
    }
