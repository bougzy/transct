const Plan = require('../models/Plan');

exports.getAllPlans = async (req, res) => {
  const { percentage } = req.query;
  if (!percentage || isNaN(percentage)) {
    return res.status(400).json({ message: 'Percentage is required and must be a number.' });
  }

  try {
    const plans = await Plan.find({});
    const plansWithProfit = plans.map(plan => {
      const profit = (plan.baseAmount * (percentage / 100));
      return {
        name: plan.name,
        baseAmount: plan.baseAmount,
        profit: profit.toFixed(2),
        duration: plan.duration,
        description: plan.description,
      };
    });

    res.json(plansWithProfit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add other plan-related controller methods here