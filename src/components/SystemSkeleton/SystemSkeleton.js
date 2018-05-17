/**
 * System Skeleton
 */

import React from 'react';
import classnames from 'classnames';
import css from './SystemSkeleton.css';

const SystemSkeleton = () => {
  /**
   * Generate x amount of bards
   */
  const generateBars = (count = 10) => {
    const bars = [];
    for (let i = 0; i < count; i++) {
      bars.push(<span key={i} className={classnames(css.skeletonBar, css.marginBottom)} />);
    }
    return bars;
  };

  /**
   * Loop nodes
   */
  const loop = (count = 2, callback = null) => {
    const nodes = [];
    for (let i = 0; i <= count; i++) {
      nodes.push(callback(i));
    }
    return nodes;
  };

  return (
    <div className={css.skeleton}>
      <header className={css.skeletonHeader}>
        <section className={css.skeletonHeaderStart}>
          <span className={css.skeletonAppIcon} />
          <span className={css.skeletonBar} />
        </section>
        <section className={css.skeletonHeaderEnd}>
          { loop(6, (i) => <span className={classnames(css.skeletonAppIcon, css.hideOnSmallScreens)} key={i} />) }
          <span className={classnames(css.skeletonDivider, css.hideOnSmallScreens)} />
          <span className={css.skeletonCircle} />
          <span className={css.skeletonDivider} />
          <span className={css.skeletonCircle} />
        </section>
      </header>
      <div className={css.skeletonPaneSet}>
        <section className={classnames(css.skeletonPane, css.skeletonPane1, css.hideOnSmallScreens)}>
          <header className={css.skeletonPaneHeader}>
            <span className={css.skeletonBar} />
          </header>
          <div className={classnames(css.skeletonPaneContent, css.randomSkeletonBarWidths)}>
            <span className={classnames(css.skeletonBar, css.marginBottom)} />
            { loop(6, (i) => <span className={classnames(css.skeletonBar, css.marginBottom, css.marginLeft)} key={i} />)}
            <br /><br />
            <span className={classnames(css.skeletonBar, css.marginBottom)} />
            { loop(5, (i) => <span className={classnames(css.skeletonBar, css.marginBottom, css.marginLeft)} key={i} />)}
          </div>
        </section>
        <section className={classnames(css.skeletonPane, css.skeletonPane2)}>
          <header className={css.skeletonPaneHeader}>
            <span className={css.skeletonBar} />
          </header>
          <div className={classnames(css.skeletonPaneContent, css.randomSkeletonBarWidths)}>
            { generateBars(100) }
          </div>
        </section>
        <section className={classnames(css.skeletonPane, css.skeletonPane3, css.hideOnSmallScreens)}>
          <header className={css.skeletonPaneHeader}>
            <span className={css.skeletonBar} />
          </header>
          <div className={css.skeletonPaneContent}>
            {
              loop(
                4,
                (i) => (
                  <div key={i} className={classnames(css.randomSkeletonBarWidths)}>
                    <span className={classnames(css.skeletonBar, css.marginBottom)} />
                    <span className={classnames(css.skeletonBar, css.marginBottom, css.marginLeft)} />
                    <span className={classnames(css.skeletonBar, css.marginBottom, css.marginLeft)} />
                    <br /><br />
                  </div>
                )
              )
            }
          </div>
        </section>
      </div>
    </div>
  );
};

export default SystemSkeleton;
