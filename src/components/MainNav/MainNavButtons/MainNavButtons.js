import {
  isFunction,
  kebabCase,
  uniqBy,
} from 'lodash';
import {
  createRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIntl } from 'react-intl';

import { Icon } from '@folio/stripes/components';

import { handleEvent } from '../../../handlerService';
import { useModules } from '../../../ModulesContext';
import { useStripes } from '../../../StripesContext';
import NavButton from '../NavButton';

import css from './MainNavButtons.css';

/**
 * Build a stable DOM id for a main navigation button.
 *
 * @param {object} module Module descriptor from useModules.
 * @param {object} link Main navigation link configuration.
 * @returns {string}
 */
const getMainNavButtonId = (module, link) => {
  return `${kebabCase(module.displayName)}-clickable-mainNavButton-${link.icon}`;
};

/**
 * Return a stable ref for a main navigation button.
 *
 * A fresh createRef on every render can invalidate overlay anchors that depend
 * on the trigger element remaining stable while open.
 *
 * @param {Map<string, React.RefObject<HTMLElement>>} refsMap Ref cache.
 * @param {string} id Unique button id.
 * @returns {React.RefObject<HTMLElement>}
 */
const getMainNavButtonRef = (refsMap, id) => {
  if (!refsMap.has(id)) {
    refsMap.set(id, createRef());
  }

  return refsMap.get(id);
};

/**
 * Create click handler for event-driven main nav buttons.
 *
 * @param {object} params Handler parameters.
 * @param {string} params.event Event name to send through handlerService.
 * @param {object} params.module Module descriptor from useModules.
 * @param {object} params.stripes Stripes context.
 * @param {Map<string, React.ComponentType>} params.handlerComponentsMap Registered handler components.
 * @param {Function} params.setHandlerComponentsMap State setter for handler components.
 * @param {React.RefObject<HTMLElement>} params.triggerRef Trigger element ref.
 * @returns {(clickEvent: React.MouseEvent) => void}
 */
const getMainNavEventClickHandler = ({
  event,
  module,
  stripes,
  handlerComponentsMap,
  setHandlerComponentsMap,
  triggerRef,
}) => {
  return (clickEvent) => {
    const component = handleEvent(
      event,
      stripes,
      module,
      {
        clickEvent,
        handlerComponentsMap,
        setHandlerComponentsMap,
        triggerRef,
      },
    );

    if (component) {
      setHandlerComponentsMap((prev) => new Map(prev).set(event, component));
    }
  };
};

/**
 * Determine whether link should be rendered through a custom render function.
 *
 * @param {unknown} renderFn Candidate render function from module root.
 * @returns {boolean}
 */
const hasMainNavCustomRender = (renderFn) => isFunction(renderFn);

/**
 * Resolve the props needed to render a styled MainNav button.
 *
 * This helper stays intentionally neutral: it only resolves trigger props and
 * leaves any overlay/menu rendering decisions to the module-provided renderFn.
 *
 * @param {object} params Resolver parameters.
 * @param {object} params.link Main navigation link configuration.
 * @param {object} params.module Module descriptor from useModules.
 * @param {object} params.stripes Stripes context.
 * @param {object} params.intl react-intl instance.
 * @param {Function} params.setHandlerComponentsMap State setter for handler components.
 * @param {Map<string, React.ComponentType>} params.handlerComponentsMap Registered handler components.
 * @param {Map<string, React.RefObject<HTMLElement>>} params.buttonRefs Ref cache for main nav buttons.
 * @param {boolean} params.hasCustomRender Whether the link uses custom renderFn.
 * @returns {object}
 */
const resolveNavButtonProps = ({
  link,
  module,
  stripes,
  intl,
  setHandlerComponentsMap,
  handlerComponentsMap,
  buttonRefs,
  hasCustomRender,
}) => {
  const id = getMainNavButtonId(module, link);
  const ref = getMainNavButtonRef(buttonRefs, id);

  const resolvers = [
    {
      select: () => hasCustomRender,
      resolve: (_candidateLink, props) => props,
    },
    {
      select: (candidateLink) => candidateLink.event,
      resolve: (candidateLink, props) => ({
        ...props,
        onClick: getMainNavEventClickHandler({
          event: candidateLink.event,
          module,
          stripes,
          handlerComponentsMap,
          setHandlerComponentsMap,
          triggerRef: ref,
        }),
      }),
    },
    {
      select: (candidateLink) => candidateLink.href,
      resolve: (candidateLink, props) => ({ ...props, href: candidateLink.href }),
    },
    {
      select: (candidateLink) => candidateLink.route,
      resolve: (candidateLink, props) => ({ ...props, to: candidateLink.route }),
    },
    {
      select: () => true,
      resolve: (_candidateLink, props) => props,
    },
  ];

  const props = {
    'aria-label': intl.formatMessage({ id: link.caption }),
    id,
    key: id,
    ref,
    icon: (
      <Icon
        icon={link.icon}
        size="large"
      />
    ),
  };

  return resolvers
    .find((resolver) => resolver.select(link))
    .resolve(link, props);
};

export const MainNavButtons = () => {
  const intl = useIntl();
  const modules = useModules();
  const stripes = useStripes();

  const [handlerComponentsMap, setHandlerComponentsMap] = useState(new Map());
  const buttonRefs = useRef(new Map()).current;

  const helpUrl = useRef(stripes.config.helpUrl ?? 'https://docs.folio.org').current;

  const renderButton = useCallback(({ link, module: m }) => {
    const moduleRoot = m.getModule();
    const checkFn = link.check && moduleRoot[link.check];
    const renderFn = link.render && moduleRoot[link.render];
    const hasCustomRender = hasMainNavCustomRender(renderFn);

    const navButtonProps = resolveNavButtonProps({
      link,
      module: m,
      stripes,
      intl,
      setHandlerComponentsMap,
      handlerComponentsMap,
      buttonRefs,
      hasCustomRender,
    });

    if (checkFn && isFunction(checkFn) && !checkFn(stripes)) {
      return null;
    }

    if (hasCustomRender) {
      const renderTrigger = (extraProps = {}) => {
        return (
          <NavButton
            {...navButtonProps}
            {...extraProps}
          />
        );
      };

      return renderFn({
        renderTrigger,
        triggerProps: navButtonProps,
      });
    }

    return <NavButton {...navButtonProps} />;
  }, [buttonRefs, intl, stripes, handlerComponentsMap]);

  const mainNavigationButtons = useMemo(() => {
    return uniqBy(Object.values(modules).flat(), 'module')
      .filter(({ links }) => links && Array.isArray(links.mainNavigation))
      .flatMap((module) => module.links.mainNavigation.map(link => ({ link, module })))
      .map(renderButton)
      .filter(Boolean);
  }, [modules, renderButton]);

  const handlerElements = useMemo(() => {
    return Array.from(handlerComponentsMap.entries())
      .map(([event, HandlerComponent]) => (
        HandlerComponent && <HandlerComponent key={event} stripes={stripes} />
      ))
      .filter(Boolean);
  }, [handlerComponentsMap, stripes]);

  return (
    <>
      {handlerElements}
      <div className={css.mainNavButtons}>
        <NavButton
          aria-label={intl.formatMessage({ id: 'stripes-core.help' })}
          data-test-item-help-button
          href={helpUrl}
          icon={<Icon
            icon="question-mark"
            size="large"
          />}
          id="helpButton"
          target="_blank"
        />
        {mainNavigationButtons}
      </div>
    </>
  );
};
