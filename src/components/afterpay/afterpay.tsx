// Dependencies
import * as React from 'react';
import { useEventListener } from 'usehooks-ts';
import type * as Square from '@square/web-sdk';

// Internals
import { useAfterpay } from '~/contexts/afterpay';
import { AfterpayContext, AfterpayProvider } from '~/contexts/afterpay';
import { useForm } from '~/contexts/form';
import type {
  AfterpayButtonProps,
  AfterpayMessageBaseProps,
  AfterpayMessageCustomComponentProps,
  AfterpayMessageProps,
  AfterpayWidgetProps,
} from './afterpay.types';

export function AfterpayButton({
  Button,
  buttonColor = 'black',
  buttonType = 'buy_now_with_afterpay',
  finalCtaButtonType = 'buy_now',
  id = 'rswps-afterpay-button',
  ...props
}: AfterpayButtonProps) {
  const containerRef = React.useRef<HTMLElement>(null);
  const afterpay = useAfterpay();
  const { cardTokenizeResponseReceived } = useForm();

  const options: Square.AfterpayButtonOptions = React.useMemo(
    () => ({
      buttonColor,
      buttonType,
      finalCtaButtonType,
      useCustomButton: Boolean(Button),
    }),
    [Button, buttonColor, buttonType, finalCtaButtonType]
  );

  /**
   * Handle the on click of the Afterpay button click
   *
   * @param e An event which takes place in the DOM.
   * @returns The data be sended to `cardTokenizeResponseReceived()` function, or an error
   */
  const handlePayment = async (e: MouseEvent) => {
    e.preventDefault();

    const result = await afterpay?.tokenize();

    if (result?.status === 'OK') {
      return cardTokenizeResponseReceived(result);
    }

    let errorMessage = `Tokenization failed with status: ${result?.status}`;
    if (result?.errors) {
      errorMessage += ` and errors: ${JSON.stringify(result?.errors)}`;
    }

    throw new Error(errorMessage);
  };

  React.useEffect(() => {
    if (afterpay) {
      afterpay?.attach(`#${id}`, options);
    }

    return () => {
      if (afterpay) {
        afterpay?.destroy();
      }
    };
  }, []);

  useEventListener('click', handlePayment, containerRef);

  if (Button) {
    return <Button {...props} id={id} ref={containerRef} />;
  }

  return <div {...props} id={id} ref={containerRef as React.RefObject<HTMLDivElement>} />;
}

export function AfterpayMessage(props: AfterpayMessageBaseProps): JSX.Element;
export function AfterpayMessage(props: AfterpayMessageCustomComponentProps): JSX.Element;
export function AfterpayMessage({
  badgeTheme = 'black-on-mint',
  component,
  id = 'rswps-afterpay-message',
  modalLinkStyle = 'circled-info-icon',
  modalTheme = 'mint',
  size = 'lg',
  ...props
}: AfterpayMessageProps) {
  const messageRef = React.useRef<HTMLDivElement>(null);
  const afterpay = useAfterpay();

  const options: Square.AfterpayMessagingOptions = React.useMemo(
    () => ({
      badgeTheme,
      modalLinkStyle,
      modalTheme,
      size,
    }),
    [badgeTheme, modalLinkStyle, modalTheme, size]
  );

  React.useEffect(() => {
    const start = async () => {
      await afterpay.attachMessaging(`#${id}`, options);
    };

    if (afterpay && !component?.Message) {
      start();
    }
  }, [component?.Message, options]);

  const onClick = async (e: MouseEvent) => {
    e.preventDefault();

    afterpay.displayInformationModal({ modalTheme });
  };

  useEventListener('click', onClick, messageRef);

  const Message = component?.Message;
  if (Message) {
    return <Message {...props} id={id} ref={messageRef} />;
  }

  return <div {...props} id={id}></div>;
}

export function AfterpayWidget({ includeBranding, id = 'rswps-afterpay-widget', ...props }: AfterpayWidgetProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const afterpay = useAfterpay();

  React.useEffect(() => {
    const start = async () => {
      await afterpay?.attachCheckoutWidget(`#${id}`, {
        includeBranding,
      });
    };

    if (afterpay) {
      start();
    }
  }, [afterpay, includeBranding]);

  return <div {...props} id={id} ref={containerRef} />;
}

function Afterpay(props: AfterpayButtonProps) {
  return (
    <AfterpayProvider>
      <AfterpayButton {...props} />
    </AfterpayProvider>
  );
}

export { AfterpayContext, AfterpayProvider };
export default Afterpay;
export type {
  AfterpayButtonProps,
  AfterpayMessageBaseProps,
  AfterpayMessageCustomComponentProps,
  AfterpayMessageProps,
  AfterpayWidgetProps,
};
