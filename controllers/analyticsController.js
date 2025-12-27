const Case = require('../models/Case');

//1. Supervisor Dashboard: Get case statistics
async function getCaseStatistics(req,res){
    try{
        const totalcases = await Case.countDocuments();
        const pendingcases = await Case.countDocuments({caseStatus: {$regex: '^open$', $options: 'i'}});
        const closedcases = await Case.countDocuments({caseStatus: {$regex: '^closed$', $options: 'i'}});

        console.log("Analytics Sent:",{totalcases, pendingcases, closedcases});

        return res.status(200).json({
            success:true,
            data:{
                totalCases: totalcases,
                pendingCount: pendingcases,
                closedCount: closedcases,
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
        };

        async function checkDeadlines(req,res){
            try{
                const delay = new Date();
                delay.setDate(delay.getDate() - 10); //10 days ago
                const overdueCases = await Case.find({
                    caseStatus: "Open",
                    createdAt: {$lte: delay},
                }).select('caseNumber caseTitle createdAt caseStatus');
                return res.status(200).json({
                    success:true,
                    Count: overdueCases.length,
                    reminder: overdueCases,
                });
                

            }
            catch(error){
                return res.status(500).json({
                    success:false,
                    error:error.message,
                });
            };
        };
    
    
    module.exports = {
        getCaseStatistics,
        getFIRtoChargeSheetTimeline,
        checkDeadlines,
    };
