/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiBadge } from '@elastic/eui';
import { defaultTo, getOr } from 'lodash/fp';
import * as React from 'react';
import { connect } from 'react-redux';
import { pure } from 'recompose';
import styled from 'styled-components';

import { ActionCreator } from 'typescript-fsa';
import { State, timelineActions } from '../../store';
import { themeSelector } from '../../store/local/app';
import { Theme } from '../../store/local/app/model';
import { timelineByIdSelector } from '../../store/selectors';
import { defaultWidth } from '../timeline/body';
import { DataProvider } from '../timeline/data_providers/data_provider';
import { FlyoutButton } from './button';
import { FlyoutPane } from './pane';

/** The height in pixels of the flyout header, exported for use in height calculations */
export const flyoutHeaderHeight: number = 50;

export const Badge = styled(EuiBadge)`
  position: absolute;
  padding-left: 4px;
  padding-right: 4px;
  right: 0%;
  top: 0%;
  border-bottom-left-radius: 5px;
`;

const Visible = styled.div<{ show: boolean }>`
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
`;

interface OwnProps {
  children?: React.ReactNode;
  flyoutHeight: number;
  headerHeight: number;
  timelineId: string;
}

interface DispatchProps {
  showTimeline?: ActionCreator<{ id: string; show: boolean }>;
  applyDeltaToWidth?: (
    {
      id,
      delta,
      bodyClientWidthPixels,
      maxWidthPercent,
      minWidthPixels,
    }: {
      id: string;
      delta: number;
      bodyClientWidthPixels: number;
      maxWidthPercent: number;
      minWidthPixels: number;
    }
  ) => void;
}

interface StateReduxProps {
  dataProviders?: DataProvider[];
  show?: boolean;
  theme?: Theme;
  width?: number;
}

type Props = OwnProps & DispatchProps & StateReduxProps;

export const FlyoutComponent = pure<Props>(
  ({
    children,
    dataProviders,
    flyoutHeight,
    headerHeight,
    show,
    showTimeline,
    timelineId,
    theme,
    width,
  }) => (
    <>
      <Visible show={show!}>
        <FlyoutPane
          flyoutHeight={flyoutHeight}
          headerHeight={headerHeight}
          onClose={() => showTimeline!({ id: timelineId, show: false })}
          timelineId={timelineId}
          width={width!}
        >
          {children}
        </FlyoutPane>
      </Visible>
      <FlyoutButton
        dataProviders={dataProviders!}
        show={!show}
        theme={theme!}
        timelineId={timelineId}
        onOpen={() => showTimeline!({ id: timelineId, show: true })}
      />
    </>
  )
);

const mapStateToProps = (state: State, { timelineId }: OwnProps) => {
  const timelineById = defaultTo({}, timelineByIdSelector(state));
  const dataProviders = getOr([], `${timelineId}.dataProviders`, timelineById);
  const show = getOr('false', `${timelineId}.show`, timelineById);
  const theme = defaultTo('dark', themeSelector(state));
  const width = getOr(defaultWidth, `${timelineId}.width`, timelineById);

  return { dataProviders, show, theme, width };
};

export const Flyout = connect(
  mapStateToProps,
  {
    showTimeline: timelineActions.showTimeline,
  }
)(FlyoutComponent);
