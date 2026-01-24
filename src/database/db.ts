import mongoose from "mongoose";
import { setTimeout } from "timers/promises";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds



class DatabaseConnection {
    public retryCount: number;
    public isConnected: boolean;

    constructor() {
        this.retryCount = 0;
        this.isConnected = false;

        // configure mongoose settings

        mongoose.set('strictQuery', true);

        // Handle connection events 

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
            this.isConnected = true
        })

        mongoose.connection.on('error', (err) => {
            console.error(` Mongodb connection error`, err);
            this.isConnected = false;
        })

        mongoose.connection.on('disconnected', () => {
            console.log('Mongodb disconnected')
            this.isConnected = false;
            // handle disconnection
        })

        // Handle application termination

        process.on('SIGINT', this.handleAppTermination.bind(this))
        process.on('sigterm', this.handleAppTermination.bind(this))
    }

    public async connect() {
        try {
            if (!process.env.MONGO_URI) {
                throw new Error('MongoDB URI is not defined in environment variables');

            }

            const connectionOptions = {
                
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4, // use Ipv4
            }

            if (process.env.NODE_ENV === 'development') {
                mongoose.set('debug', true);
            }

            await mongoose.connect(process.env.MONGO_URI, connectionOptions);
            this.retryCount = 0; // Reset retry count on successfull connection

        } 
        catch (error:unknown) {
          
            let errorMessage = 'Unknown Connection Error';
            
            if (error instanceof Error) {
                errorMessage = error.message;
                
                console.error("❌ Error Stack:", error.stack);
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            // 2. Saaf-saaf batao kya hua
            console.error(`❌ Failed to connect to MongoDB: ${errorMessage}`);

            // 3. Retry Logic call karein
            await this.handleConnectionError();
        }
    }

    private async handleConnectionError() {
        if (this.retryCount < MAX_RETRIES) {
            this.retryCount++;
            console.log(`Retriying connection ... Attempt ${this.retryCount} of ${MAX_RETRIES}`);


            // await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));

            // new type do
            await setTimeout(RETRY_INTERVAL);

            return this.connect()
        } else {
            console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
            process.exit(1);
        }
    }


    private async handleDisconnection() {
        if(!this.isConnected){
            console.log('Attempting to reconnect to mongodb');
            this.connect()
        }
     }

    public async handleAppTermination() {
        try {
            await mongoose.connection.close();
            console.log('Mongodb connection closed through app termination');
            process.exit(0)
        } catch (error) {
            if(error instanceof Error){
                console.log('Error during database disconnection:',error.message)
            }
            console.log('error during dabasabse disconnection handle')
            process.exit(1)
        }
     }

     // Get the current connection status
    public getConnectionStatus() { 
        return {
          isConnected:this.isConnected,
          readyState:mongoose.connection.readyState,
          host:mongoose.connection.host,
          name:mongoose.connection.name
        }
    }
}


// create a singleton instance 

const dbConnection = new DatabaseConnection();

// Export the connect function and the instance

export default dbConnection.connect.bind(dbConnection);

export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection)