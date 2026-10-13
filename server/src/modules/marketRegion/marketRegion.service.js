import MarketRegion from './marketRegion.model.js';

export const marketRegionService = {
  async listActiveRegions() {
    const regions = await MarketRegion.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']],
    });
    return regions.map((r) => r.toJSON());
  },
};

export default marketRegionService;
