interface Navigator {
	virtualKeyboard?: {
		overlaysContent: boolean;
		show: () => void;
		hide: () => void;
		boundingRect: DOMRect;
		addEventListener: (type: string, listener: (evt: BR) => void) => void;
	};
}

interface BR extends Event {
	target: EventTarget & {
		boundingRect: DOMRect;
	};
}
