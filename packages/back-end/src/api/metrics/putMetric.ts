import { PutMetricResponse } from "../../../types/openapi";
import { getDataSourceById } from "../../models/DataSourceModel";
import { getMetricById, updateMetric } from "../../models/MetricModel";
import { createApiRequestHandler } from "../../util/handler";
import { postPutMetricValidator } from "../../validators/openapi";
import {
  createMetric,
  postPutMetricApiPayloadIsValid,
  postPutMetricApiPayloadToMetricInterface,
  toMetricApiInterface,
} from "../../services/experiments";

export const putMetric = createApiRequestHandler(postPutMetricValidator)(
  async (req): Promise<PutMetricResponse> => {
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
    const metric_update = postPutMetricApiPayloadToMetricInterface(
      req.body,
      req.organization,
      datasource
    );
    const metric = await getMetricById(
      req.params.id,
      req.organization.id,
      false
    );
    if (!metric) {
        // Create Metric if it doesn't exist
        const createdMetric = await createMetric(metric_update);
        return {
          metric: toMetricApiInterface(req.organization, createdMetric, datasource),
        };
    } else {
        // Update Metric if it does exist
        try {
            await updateMetric(metric.id, metric_update, req.organization.id);
        } catch (e) {
          throw new Error(`Metric ${metric.id}: ${e.message}`);
        }
        return {
          metric: toMetricApiInterface(req.organization, metric, datasource),
        };
    }
  }
);
