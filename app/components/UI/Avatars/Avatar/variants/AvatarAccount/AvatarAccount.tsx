/* eslint-disable react/prop-types */

// Third party dependencies.
import React from 'react';

// External dependencies.
import { toDataUrl } from '../../../../../../util/blockies';
import Avatar, {
  AvatarVariants,
} from '../../../../../../component-library/components/Avatars/Avatar';

// Internal dependencies.
import { AvatarAccountProps, AvatarAccountType } from './AvatarAccount.types';

const AvatarAccount = ({
  type = AvatarAccountType.JazzIcon,
  accountAddress,
  ...props
}: AvatarAccountProps) => (
  <>
    {type === AvatarAccountType.JazzIcon ? (
      <Avatar {...props} variant={AvatarVariants.JazzIcon} />
    ) : (
      <Avatar
        source={{ uri: toDataUrl(accountAddress) }}
        {...props}
        variant={AvatarVariants.Image}
      />
    )}
  </>
);

export default AvatarAccount;

export { AvatarAccount };
