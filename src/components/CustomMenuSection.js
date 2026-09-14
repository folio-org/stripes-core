import { template, templateSettings } from 'lodash';

import { Button } from '@folio/stripes-components';

import { useStripes } from '../StripesContext';
import useNamespace from './Namespace/useNamespace';

const data = [
  { module: '@folio/users', id: 'search', text: 'hola', link: 'https://duckduckgo.com/' },
  { module: '@folio/users', id: 'details', text: 'static link', link: 'https://duckduckgo.com/?q=whist&atb=v526-1&ia=web' },
  { module: '@folio/users', id: 'details', text: 'dynamic link', link: 'https://duckduckgo.com/?q={{user.barcode}}' },
  { module: '@folio/users', id: 'details', text: 'dynamic {{user.personal.firstName}} {{user.personal.lastName}}', link: 'https://duckduckgo.com/?q={{user.id}}' },
];


const CustomMenuSection = (props) => {
  const stripes = useStripes();
  const [namespace] = useNamespace();

  // treat lodash templates like mustache templates
  templateSettings.interpolate = /{{([^}]*)}}/g;

  const handlers = data.filter(i => i.module === namespace && i.id === props.id);
  if (handlers.length) {
    return handlers.map(handler => {
      const text = template(handler.text)({ ...props, stripes });
      const link = template(handler.link)({ ...props, stripes });

      return <Button
        buttonStyle="dropdownItem"
        href={handler.link.startsWith('/') ? undefined : link}
        key={link}
        to={handler.link.startsWith('/') ? link : undefined}
        >{text}</Button>;
    });
  }

  return null;
};

export default CustomMenuSection;