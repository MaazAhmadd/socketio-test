interface Navigator {
	virtualKeyboard?: VKEventProps & {
		addEventListener: (type: string, listener: (evt: VKEvent) => void) => void;
	};
}

interface VKEvent extends Event {
	target: EventTarget & VKEventProps;
}

type VKEventProps = {
	overlaysContent: boolean;
	show: () => void;
	hide: () => void;
	boundingRect: DOMRect;
};
