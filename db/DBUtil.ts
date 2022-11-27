import mongoose from 'mongoose';

export class DBUtil {

    public static connectToDB(dbUrl: string, dbName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            mongoose.connect(dbUrl, {
                dbName: dbName
            }, (error) => {
                if (error) {
                    console.log(error);
                    reject('DB Connection is FAILED');
                }
                resolve('DB Connection is SUCCESS');
            })
        })
    }
}

