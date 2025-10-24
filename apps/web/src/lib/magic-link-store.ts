type MagicLinkPayload = {
  identifier: string;
  url: string;
  expires: Date;
};

type MagicLinkGlobal = typeof globalThis & {
  __magicLinks?: MagicLinkPayload[];
};

const getStore = () => {
  const global = globalThis as MagicLinkGlobal;
  if (!global.__magicLinks) {
    global.__magicLinks = [];
  }
  return global.__magicLinks;
};

export function pushMagicLink(payload: MagicLinkPayload) {
  const store = getStore();
  store.push(payload);
}

export function pickLatestMagicLink(identifier?: string) {
  const store = getStore();
  if (!store.length) return undefined;

  for (let index = store.length - 1; index >= 0; index -= 1) {
    const item = store[index];
    if (!identifier || item.identifier === identifier) {
      return item;
    }
  }

  return undefined;
}

export function clearMagicLinks() {
  const store = getStore();
  store.splice(0, store.length);
}
