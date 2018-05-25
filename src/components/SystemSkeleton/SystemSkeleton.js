/**
 * System Skeleton
 */

import React from 'react';
import classnames from 'classnames';
import css from './SystemSkeleton.css';

const SystemSkeleton = () => (
  <div className={css.skeleton}>
    <header className={css.skeletonHeader}>
      <section className={css.skeletonHeaderStart}>
        <span className={css.skeletonAppIcon} />
        <span className={css.skeletonBar} />
      </section>
      <section className={css.skeletonHeaderEnd}>
        <span className={classnames(css.skeletonAppIcon, css.hideOnSmallScreens)} />
        <span className={classnames(css.skeletonAppIcon, css.hideOnSmallScreens)} />
        <span className={classnames(css.skeletonAppIcon, css.hideOnSmallScreens)} />
        <span className={classnames(css.skeletonAppIcon, css.hideOnSmallScreens)} />
        <span className={classnames(css.skeletonAppIcon, css.hideOnSmallScreens)} />
        <span className={classnames(css.skeletonAppIcon, css.hideOnSmallScreens)} />
        <span className={classnames(css.skeletonDivider, css.hideOnSmallScreens)} />
        <span className={css.skeletonCircle} />
        <span className={css.skeletonDivider} />
        <span className={css.skeletonCircle} />
      </section>
    </header>
    <div className={css.content} />
  </div>
);

export default SystemSkeleton;
