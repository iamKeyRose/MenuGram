export const useTelegram = () => {
  const tg = (window as any).Telegram?.WebApp;

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    queryId: tg?.initDataUnsafe?.query_id,
    expand: () => tg?.expand(),
    close: () => tg?.close(),
    MainButton: tg?.MainButton,
    ready: () => tg?.ready(),
  };
};
