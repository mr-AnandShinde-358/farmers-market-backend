

import { getDBStatus } from "../database/db";
import type { Request,Response } from "express";


export const checkHealth = async (req:Request,res:Response)=>{
    // Todo:Implement health chek functionality

    try {
        const dbStatus = getDBStatus();

        const healthStatus ={
            status:'OK',
            timeStamp:new Date().toISOString(),

            services:{
                database:{
                    status:dbStatus.isConnected?'healthy':'unhealthy',
                    details:{
                        ...dbStatus,
                        readyStatus:getReadyStateText(dbStatus.readyState)
                    }
                },

                server:{
                    status:'healthy',
                    uptime:process.uptime(),
                    memoryUsage:process.memoryUsage()
                }
            }
        }

        const httpStaus = healthStatus.services.database.status === 'healthy' ? 200:503

        res.status(httpStaus).json(healthStatus)
    } catch (error) {
        console.error('Health check failed', error);
        res.status(500).json({
            status: 'ERROR',
            timeStamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : "Unknown error"
        });
        
    }
}


function getReadyStateText(state: number): string {
    switch (state) {
        case 0: return 'disconnected';
        case 1: return 'connected';
        case 2: return 'connecting';     // Spelling fixed
        case 3: return 'disconnecting';  // Spelling fixed
        default: return 'unknown';       // Spelling fixed
    }
}