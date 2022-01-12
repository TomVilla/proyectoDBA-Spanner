const spanner = require('../spanner.js');
class FlightController {

    constructor() {
        this.table = spanner.table('flight');
    }
    
    async getFlights() {
        const query = {
            sql: 'SELECT * FROM flight',
          };
          try {
            const [rows] = await spanner.run(query);
            return rows;
          } catch (err) {
            console.error('ERROR:', err);
          }
    }

    async getFlight(id) {
        const query = {
            sql: `SELECT * FROM flight WHERE flightid = ${id}`,
          };
          try {
            const [rows] = await spanner.run(query);
            return rows;
          } catch (err) {
            console.error('ERROR:', err);
          }
    }

    async createFlight(flight) {
      var d = new Date();
      var timestamp = d.getTime();
      flight.flightid = timestamp;
        try {
            await this.table.insert([{flightid: flight.flightid, flightsource: flight.flightsource, flightdest: flight.flightdest, flightdate: flight.flightdate}]);
            return true;
        } catch (err) {
            console.error('ERROR:', err);
        }

    }

    async updateFlight(id, flight) {
        try{
            await this.table.update([{flightid: id, flightsource: flight.flightsource, flightdest: flight.flightdest, flightdate: flight.flightdate}]);
            return true;
        }
        catch(err){
            console.error('ERROR:', err);
        }
    }

    async deleteFlight(id) {
        spanner.runTransaction(async (err, transaction) => {
          if (err) {
            console.error(err);
            return;
          }

          try {
            const [rowCount] = await transaction.runUpdate({
                sql: `DELETE FROM seat WHERE flightid=${id}`,
            });
            console.log(`Dato eliminado de seat.` + rowCount);
          } catch (err) {
            console.error('ERROR:', err);
          }
          try{
            const [rowCount] = await transaction.runUpdate({
                sql: `DELETE FROM bookingdetails WHERE bookingid IN (SELECT bookingid FROM booking WHERE flightid=${id})`,
            });
            console.log(`Dato eliminado de bookingdetails.` + rowCount);
          }catch(err){
            console.error('ERROR:', err);
          }
          try {
            const [rowCount] = await transaction.runUpdate({
                sql: `DELETE FROM booking WHERE flightid=${id}`,
            });
            console.log(`Dato eliminado de booking.` + rowCount);
          } catch (err) {
            console.error('ERROR:', err);
          }
          try {
            const [rowCount] = await transaction.runUpdate({
                sql: `DELETE FROM flight WHERE flightid=${id}`,
            })
            console.log(`Dato eliminado de flight.` + rowCount);
            await transaction.commit();
          } catch (err) {
            console.error('ERROR:', err);
          }
        });
    }


}

module.exports = FlightController;
