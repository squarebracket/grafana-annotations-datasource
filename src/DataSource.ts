import defaults from 'lodash/defaults';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

interface GrafanaAnnotation {
  id: number;
  tags: string[];
  text: string;
  time: number;
}

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      query.tags = query.tags.map(tag => getTemplateSrv().replace(tag, options.scopedVars, 'csv'));
      return this.doRequest(query).then(response => {
        const frame = new MutableDataFrame({
          refId: query.refId,
          fields: [
            { name: 'Time', type: FieldType.time },
            { name: 'Event', type: FieldType.string },
            { name: 'Data', type: FieldType.string },
          ],
        });
        response.data.forEach((event: GrafanaAnnotation) => {
          frame.appendRow([event.time, event.text.split('\n')[0], event.text.split('\n')[1]]);
        });
        return frame;
      });
    });

    return Promise.all(promises).then(data => {
      console.log(data.flat());
      return { data: data.flat() };
    });
  }

  async doRequest(query: MyQuery) {
    const result = await getBackendSrv().datasourceRequest({
      method: 'GET',
      url: '/api/annotations',
      params: {
        ...query,
      },
    });
    return result;
  }

  async testDatasource() {
    // it's just querying grafana, so assume it's up
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
