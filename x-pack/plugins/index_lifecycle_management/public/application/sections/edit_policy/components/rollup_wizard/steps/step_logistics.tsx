/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Component } from 'react';
import { i18n } from '@kbn/i18n';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@kbn/i18n/react';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiText,
  EuiTitle,
  EuiFormRow,
  EuiSuperSelect,
  EuiSwitch,
  EuiSpacer,
} from '@elastic/eui';

import { loadPolicies } from '../../../../../services/api';

import { DescribedFormRow } from '../../../../components';

// @ts-ignore
import { StepError } from './components';

interface Props {
  fields: Record<string, any>;
  onFieldsChange: (arg: unknown) => void;
  hasErrors: boolean;
  areStepErrorsVisible: boolean;
}

interface State {
  isLoadingPolicies: boolean;
  useCustomPolicy: boolean;
  policies: string[];
}

export class StepLogistics extends Component<Props, State> {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    onFieldsChange: PropTypes.func.isRequired,
    hasErrors: PropTypes.bool.isRequired,
    areStepErrorsVisible: PropTypes.bool.isRequired,
  };

  state = { isLoadingPolicies: true, policies: [], useCustomPolicy: false };

  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.state,
      useCustomPolicy: Boolean(props.fields.rollupIndexIlmPolicy),
    };
    this.loadIlmPolicies();
  }

  async loadIlmPolicies() {
    if (!this.state.isLoadingPolicies) {
      this.setState({ isLoadingPolicies: true });
    }
    try {
      const policies = await loadPolicies(false);
      this.setState({
        policies: policies.map(({ name }) => name),
      });
    } finally {
      this.setState({ isLoadingPolicies: false });
    }
  }

  render() {
    const { fields, onFieldsChange } = this.props;
    const { rollupIndexIlmPolicy } = fields;

    const { policies, useCustomPolicy, isLoadingPolicies } = this.state;

    const policyOptions = policies.map((policy) => ({
      value: policy,
      inputDisplay: policy,
    }));

    return (
      <>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle data-test-subj="rollupCreateLogisticsTitle">
              <h2>
                <FormattedMessage
                  id="xpack.indexLifecycleMgmt.rollup.stepLogisticsTitle"
                  defaultMessage="Logistics"
                />
              </h2>
            </EuiTitle>

            <EuiSpacer size="s" />

            <EuiText>
              <p>
                <FormattedMessage
                  id="xpack.indexLifecycleMgmt.rollup.stepLogistics.logisticsDescription"
                  defaultMessage="Configure how the rollup index is managed."
                />
              </p>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="l" />

        <EuiForm>
          <DescribedFormRow
            title={
              <EuiTitle size="s">
                <h3>
                  <FormattedMessage
                    id="xpack.indexLifecycleMgmt.rollup.stepLogistics.sectionRollupIndexILMPolicy"
                    defaultMessage="Rollup index ILM policy"
                  />
                </h3>
              </EuiTitle>
            }
            description={
              <>
                <FormattedMessage
                  id="xpack.indexLifecycleMgmt.rollup.stepLogistics.indexILMPolicyDescription"
                  defaultMessage="Specify a policy to manage the rollup index generated by this action. By default, the current ILM policy is used to manage the new rollup index."
                />
                <EuiSpacer />
                <EuiSwitch
                  label={i18n.translate(
                    'xpack.indexLifecycleMgmt.rollup.stepLogistics.useCustomPolicySwitchLabel',
                    { defaultMessage: 'Use custom ILM policy' }
                  )}
                  checked={useCustomPolicy}
                  onChange={(e) => {
                    this.setState({ useCustomPolicy: e.target.checked });
                    if (!e.target.checked) {
                      onFieldsChange({ rollupIlmPolicy: undefined });
                    }
                  }}
                />
              </>
            }
            fullWidth
          >
            {useCustomPolicy ? (
              <EuiFormRow
                label={
                  <FormattedMessage
                    id="xpack.indexLifecycleMgmt.rollup.stepLogistics.indexILMPolicyLabel"
                    defaultMessage="ILM policy"
                  />
                }
                fullWidth
              >
                <EuiSuperSelect
                  valueOfSelected={rollupIndexIlmPolicy}
                  onChange={(policy) => onFieldsChange({ rollupIndexIlmPolicy: policy })}
                  options={policyOptions}
                  isLoading={isLoadingPolicies}
                  data-test-subj="rollupIndexIlmPolicy"
                  fullWidth
                />
              </EuiFormRow>
            ) : (
              <div />
            )}
          </DescribedFormRow>
        </EuiForm>

        {this.renderErrors()}
      </>
    );
  }

  renderErrors = () => {
    const { areStepErrorsVisible, hasErrors } = this.props;

    if (!areStepErrorsVisible || !hasErrors) {
      return null;
    }

    return <StepError />;
  };
}
