import { AsyncHandler } from '../@types/middlewares/asyncHandler';

const asyncHandler: AsyncHandler = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default asyncHandler;
