import { Main } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { TextInput } from '@strapi/design-system';

import { getTranslation } from '../utils/getTranslation';

const HomePage = () => {
  const { formatMessage } = useIntl();

  const hadleChange = (e: any) => {
    console.log('change', e);
  };

  return (
    <Main>
      <h1>Welcome to {formatMessage({ id: getTranslation('plugin.name') })}</h1>

      <TextInput
        placeholder="This is a content placeholder"
        size="M"
        type="file"
        onChange={hadleChange}
      />
    </Main>
  );
};

export { HomePage };
