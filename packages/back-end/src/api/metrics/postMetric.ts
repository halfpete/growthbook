import { PostMetricResponse } from "../../../types/openapi";
import { createApiRequestHandler } from "../../util/handler";
import { postPutMetricValidator } from "../../validators/openapi";
import {
  createMetric,
  postPutMetricApiPayloadIsValid,
  postPutMetricApiPayloadToMetricInterface,
  toMetricApiInterface,
} from "../../services/experiments";
import { getDataSourceById } from "../../models/DataSourceModel";

export const postMetric = createApiRequestHandler(postPutMetricValidator)(
  async (req): Promise<PostMetricResponse> => {
    const { datasourceId } = req.body;

    const datasource = await getDataSourceById(
      datasourceId,
      req.organization.id
    );
    if (!datasource) {
      throw new Error(`Invalid data source: ${datasourceId}`);
    }

    const validationResult = postPutMetricApiPayloadIsValid(req.body, datasource);
    if (!validationResult.valid) {
      throw new Error(validationResult.error);
    }

    const metric = postPutMetricApiPayloadToMetricInterface(
      req.body,
      req.organization,
      datasource
    );

    const createdMetric = await createMetric(metric);

    return {
      metric: toMetricApiInterface(req.organization, createdMetric, datasource),
    };
  }
);
