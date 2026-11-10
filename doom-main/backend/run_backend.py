import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

if __name__ == "__main__":
    import uvicorn
    from backend.app.config import settings
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=False)
