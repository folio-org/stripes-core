import { render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { createMemoryHistory } from 'history';

import TitleManager from './TitleManager';
import Harness from '../../../test/jest/helpers/harness';

describe('TitleManager', () => {
  it('renders a title with a default postfix', async () => {
    const stripes = {
      config: {},
      hasPerm: jest.fn(),
    };

    const page = 'record-application';

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <TitleManager page={page}>
          <>thunder - chicken</>
        </TitleManager>
      </Harness>
    );

    await waitFor(() => expect(document.title).toBe(`${page} - FOLIO`));
  });

  it('renders prefix, page, record, postfix', async () => {
    const stripes = {
      config: {
        platformName: 'two mile'
      },
      hasPerm: jest.fn(),
    };

    const prefix = 'pre'
    const page = 'steve';
    const record = '8:41.5';

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <TitleManager page={page} prefix={prefix} record={record}>
          <>thunder - chicken</>
        </TitleManager>
      </Harness>
    );

    await waitFor(() => expect(document.title).toBe(`${prefix}${page} - ${record} - ${stripes.config.platformName}`));
  });


  it('renders prefix, record, postfix', async () => {
    const stripes = {
      config: {
        platformName: 'two mile'
      },
      hasPerm: jest.fn(),
    };

    const prefix = 'pre'
    const record = '8:41.5';

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <TitleManager prefix={prefix} record={record}>
          <>thunder - chicken</>
        </TitleManager>
      </Harness>
    );

    await waitFor(() => expect(document.title).toBe(`${prefix}${record} - ${stripes.config.platformName}`));
  });
});



// const APP = 'FOLIO';

//   static defaultProps = { prefix: '' }

//   renderTitle = (currentTitle) => {
//     const { prefix, page, record, stripes } = this.props;
//     const postfix = stripes.config?.platformName || APP;

//     if (typeof currentTitle !== 'string') return '';

//     const tokens = currentTitle.split(' - ');

//     /**
//      * When there are 2 items - that means there are page and postfix.
//      * If we don't clear the tokens[1] item then we'll have two postfixes - in tokens[1] and tokens[2] will be added later
//      */
//     if (tokens.length === 2) {
//       tokens[1] = '';
//     }

//     if (page) tokens[0] = page;
//     if (record) tokens[1] = record;

//     tokens[2] = postfix;

//     return prefix + tokens
//       .filter(t => t)
//       .join(' - ');
//   }

//   render() {
//     return (
//       <Titled title={this.renderTitle}>
//         {this.props.children}
//       </Titled>
//     );
//   }
// }

// export default withStripes(TitleManager);
