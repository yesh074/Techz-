import asyncio
import logging
from datetime import datetime
from backend.app.agents.orchestrator import orchestrator
from backend.app.agents.demand_prediction_agent import demand_prediction_agent
from backend.app.database.mongo import get_collection

logger = logging.getLogger("techz.worker")

class BackgroundWorker:
    def __init__(self):
        self.is_running = False
        self._task = None

    async def start(self):
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("TECHZ Background Worker started successfully.")

    async def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("TECHZ Background Worker stopped.")

    async def _run_loop(self):
        logger.info("Autonomous AI background execution active. Monitoring institutional telemetry...")
        cycle_count = 0
        while self.is_running:
            try:
                # Cycle every 60 seconds (simulating institutional telemetry sweep)
                await asyncio.sleep(60)
                cycle_count += 1

                # Every 3 minutes, run an autonomous demand audit across all books
                if cycle_count % 3 == 0:
                    logger.info("Running scheduled institutional book demand audit...")
                    predictions = demand_prediction_agent.predict_all()

                    high_risk = [p for p in predictions if p["risk_level"] == "HIGH"]
                    if high_risk:
                        await orchestrator.log_activity(
                            agent_name="Demand Prediction Agent",
                            action="Scheduled Demand Audit",
                            title="Routine Inventory Audit Completed",
                            description=f"Audited {len(predictions)} course textbooks. Detected {len(high_risk)} critical shortage risks.",
                            data_considered={"books_audited": len(predictions), "high_risk_count": len(high_risk)},
                            result="Recommendations refreshed"
                        )

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in background worker loop: {e}")
                await asyncio.sleep(10)

background_worker = BackgroundWorker()
