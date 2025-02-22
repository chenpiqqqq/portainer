import { useRouter } from '@uirouter/react';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';

import type { Environment } from '@/react/portainer/environments/types';
import {
  confirmAsync,
  confirmDestructiveAsync,
} from '@/portainer/services/modal.service/confirm';
import { promptAsync } from '@/portainer/services/modal.service/prompt';
import * as notifications from '@/portainer/services/notifications';
import { deleteEndpoint } from '@/react/portainer/environments/environment.service';
import { useActivateDeviceMutation } from '@/portainer/hostmanagement/open-amt/queries';

import { Button } from '@@/buttons';
import { Link } from '@@/Link';

interface Props {
  selectedItems: Environment[];
  isFDOEnabled: boolean;
  isOpenAMTEnabled: boolean;
  showWaitingRoomLink: boolean;
}

enum DeployType {
  FDO = 'FDO',
  MANUAL = 'MANUAL',
}

export function EdgeDevicesDatatableActions({
  selectedItems,
  isOpenAMTEnabled,
  isFDOEnabled,
  showWaitingRoomLink,
}: Props) {
  const router = useRouter();
  const activateDeviceMutation = useActivateDeviceMutation();

  return (
    <div className="actionBar">
      <Button
        disabled={selectedItems.length < 1}
        color="danger"
        onClick={() => onDeleteEdgeDeviceClick()}
        icon={Trash2}
      >
        Remove
      </Button>

      <Button onClick={() => onAddNewDeviceClick()} icon={Plus}>
        Add Device
      </Button>

      {isOpenAMTEnabled && (
        <Button
          disabled={selectedItems.length !== 1}
          onClick={() => onAssociateOpenAMTClick(selectedItems)}
          icon={LinkIcon}
        >
          Associate with OpenAMT
        </Button>
      )}

      {showWaitingRoomLink && (
        <Link to="edge.devices.waiting-room">
          <Button>Waiting Room</Button>
        </Link>
      )}
    </div>
  );

  async function onDeleteEdgeDeviceClick() {
    const confirmed = await confirmDestructiveAsync({
      title: 'Are you sure ?',
      message:
        'This action will remove all configurations associated to your environment(s). Continue?',
      buttons: {
        confirm: {
          label: 'Remove',
          className: 'btn-danger',
        },
      },
    });

    if (!confirmed) {
      return;
    }

    await Promise.all(
      selectedItems.map(async (environment) => {
        try {
          await deleteEndpoint(environment.Id);

          notifications.success(
            'Environment successfully removed',
            environment.Name
          );
        } catch (err) {
          notifications.error(
            'Failure',
            err as Error,
            'Unable to remove environment'
          );
        }
      })
    );

    await router.stateService.reload();
  }

  async function onAddNewDeviceClick() {
    const result = isFDOEnabled
      ? await promptAsync({
          title: 'How would you like to add an Edge Device?',
          inputType: 'radio',
          inputOptions: [
            {
              text: 'Provision bare-metal using Intel FDO',
              value: DeployType.FDO,
            },
            {
              text: 'Deploy agent manually',
              value: DeployType.MANUAL,
            },
          ],
          buttons: {
            confirm: {
              label: 'Confirm',
              className: 'btn-primary',
            },
          },
        })
      : DeployType.MANUAL;

    switch (result) {
      case DeployType.FDO:
        router.stateService.go('portainer.endpoints.importDevice');
        break;
      case DeployType.MANUAL:
        router.stateService.go('portainer.wizard.endpoints', {
          edgeDevice: true,
        });
        break;
      default:
        break;
    }
  }

  async function onAssociateOpenAMTClick(selectedItems: Environment[]) {
    const selectedEnvironment = selectedItems[0];

    const confirmed = await confirmAsync({
      title: '',
      message: `Associate ${selectedEnvironment.Name} with OpenAMT`,
      buttons: {
        cancel: {
          label: 'Cancel',
          className: 'btn-default',
        },
        confirm: {
          label: 'Confirm',
          className: 'btn-primary',
        },
      },
    });

    if (!confirmed) {
      return;
    }

    activateDeviceMutation.mutate(selectedEnvironment.Id, {
      onSuccess() {
        notifications.notifySuccess(
          'Successfully associated with OpenAMT',
          selectedEnvironment.Name
        );
      },
    });
  }
}
