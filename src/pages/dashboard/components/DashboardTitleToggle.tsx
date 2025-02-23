import React from 'react';
import cx from 'classnames';

type Props = {
  title: string;
  mainTitle: string;
  secondaryTitle: string;
  secondaryActive: boolean;
  setSecondaryActive(value: boolean): void
};

const DashboardTitleToggle = ({
  title,
  mainTitle,
  secondaryTitle,
  secondaryActive,
  setSecondaryActive,
}: Props) => (
  <div>
    {title}
    <span className="px-2">&gt;</span>
    <span className={cx({ 'cursor-pointer': true, 'font-semibold': !secondaryActive, 'text-highlight-1': !secondaryActive })} onClick={() => setSecondaryActive(false)}>{mainTitle}</span>
    <span className="mx-2">|</span>
    <span className={cx({ 'cursor-pointer': true, 'font-semibold': secondaryActive, 'text-highlight-1': secondaryActive })} onClick={() => setSecondaryActive(true)}>{secondaryTitle}</span>
  </div>
);

export default DashboardTitleToggle;
