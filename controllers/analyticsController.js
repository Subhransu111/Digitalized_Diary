const Case = require('../models/Case');

//1. Supervisor Dashboard: Get case statistics
async function getCaseStatistics(req,res){
    try{
        const totalcases = await Case.countDocuments();
        const pendingcases = await Case.countDocuments({caseStatus: {$regex: '^open$', $options: 'i'}});
        const closedcases = await Case.countDocuments({caseStatus: {$regex: '^closed$', $options: 'i'}});

        return res.status(200).json({
            success:true,
            data:{
                TotalCases: totalcases,
                Pending: pendingcases,
                Closed: closedcases,
                pendencyRate: totalcases > 0 ? ((pendingcases / totalcases) * 100).toFixed(2) + '%' : '0%',
            },

        });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });

        }
    };

    //2. Data for Visualization (FIR to ChargeSheet Timeline)

    async function getFIRtoChargeSheetTimeline(req,res){
        try{
            // Find closed cases - case insensitive query
            const closedCases = await Case.find({caseStatus: "Closed"}).select('caseNumber caseTitle createdAt updatedAt');

            const timelineData = closedCases.map(c=>{
                if(!c.createdAt || !c.updatedAt) return null;
                const start = c.createdAt;
                const end = c.updatedAt;
                if (isNaN(start) || isNaN(end)) return null;
                const duration = Math.abs(end-start);
                const daysTaken = Math.ceil(duration/(1000*60*60*24));
                return {
                    caseNumber: c.caseNumber,
                    caseTitle: c.caseTitle,
                    daysTaken: daysTaken,
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0]
            };
            })
            .filter(item => item !== null);

                 return res.status(200).json({
                    success:true,
                    data: timelineData,
                });

            

        }
        catch(error){
            return res.status(500).json({
                success:false,
                error:error.message,
            });
        }
    }
    module.exports = {
        getCaseStatistics,
        getFIRtoChargeSheetTimeline,
    };
