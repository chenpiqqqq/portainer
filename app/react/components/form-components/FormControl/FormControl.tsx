import { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

import { Tooltip } from '@@/Tip/Tooltip';

import { FormError } from '../FormError';

export type Size = 'xsmall' | 'small' | 'medium' | 'large' | 'vertical';

export interface Props {
  inputId?: string;
  label: ReactNode;
  size?: Size;
  tooltip?: string;
  children: ReactNode;
  errors?: ReactNode;
  required?: boolean;
  setTooltipHtmlMessage?: boolean;
}

export function FormControl({
  inputId,
  label,
  size = 'small',
  tooltip = '',
  children,
  errors,
  required,
  setTooltipHtmlMessage,
}: PropsWithChildren<Props>) {
  return (
    <div
      className={clsx(
        'form-group',
        'after:content-[""] after:clear-both after:table' // to fix issues with float
      )}
    >
      <label
        htmlFor={inputId}
        className={clsx(sizeClassLabel(size), 'control-label', 'text-left')}
      >
        {label}

        {required && <span className="text-danger">*</span>}

        {tooltip && (
          <Tooltip message={tooltip} setHtmlMessage={setTooltipHtmlMessage} />
        )}
      </label>

      <div className={sizeClassChildren(size)}>
        {children}

        {errors && (
          <span className="help-block">
            <FormError>{errors}</FormError>
          </span>
        )}
      </div>
    </div>
  );
}

function sizeClassLabel(size?: Size) {
  switch (size) {
    case 'large':
      return 'col-sm-5 col-lg-4';
    case 'medium':
      return 'col-sm-4 col-lg-3';
    case 'xsmall':
      return 'col-sm-2';
    case 'vertical':
      return '';
    default:
      return 'col-sm-3 col-lg-2';
  }
}

function sizeClassChildren(size?: Size) {
  switch (size) {
    case 'large':
      return 'col-sm-7 col-lg-8';
    case 'medium':
      return 'col-sm-8 col-lg-9';
    case 'xsmall':
      return 'col-sm-10';
    case 'vertical':
      return '';
    default:
      return 'col-sm-9 col-lg-10';
  }
}
