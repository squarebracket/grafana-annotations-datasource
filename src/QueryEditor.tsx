import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { Field, Switch, TagsInput } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onTagsChange = (tags: string[]) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, tags });
    // executes the query
    onRunQuery();
  };

  onDescChange = (event: React.FormEvent<HTMLInputElement>) => {
    console.log(event);
    const includeDescription = event.currentTarget.checked;
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, includeDescription });
    // executes the query
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { includeDescription, tags } = query;

    return (
      <div style={{ width: '50%' }}>
        <div style={{ verticalAlign: 'middle' }}>
          <Field
            horizontal
            label="Include description"
            description="Adds a field in the query response for the textual representation of an event"
          >
            <Switch value={includeDescription} onChange={this.onDescChange} />
          </Field>
        </div>
        <div className="gf-form">
          <TagsInput tags={tags} onChange={this.onTagsChange} />
        </div>
      </div>
    );
  }
}
