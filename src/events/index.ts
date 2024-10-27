import { activateHandler } from "./activate";
import {
  backgroundFetchAbortHandler,
  backgroundFetchFailHandler,
  backgroundFetchSuccessHandler,
} from "./backgroundfetch";
import { fetchHandler } from "./fetch";
import { messageHandler } from "./message";
import { pushHandler } from "./push";
import { syncHandler } from "./sync";
import { installHandler } from "./install";
import { notificationClickHandler } from "./notificationclick";
import { notificationCloseHandler } from "./notificationclose";

export const DEFAULT_EVENTS = {
  install: null, // installHandler,
  activate: null, // activateHandler,
  fetch: null, // fetchHandler,
  message: null, // messageHandler,
  push: null, // pushHandler,
  sync: null, // syncHandler,
  notificationclick: null, // notificationClickHandler,
  notificationclose: null, // notificationCloseHandler,
  backgroundfetchsuccess: null, // backgroundFetchSuccessHandler,
  backgroundfetchfail: null, // backgroundFetchFailHandler,
  backgroundfetchabort: null, // backgroundFetchAbortHandler,
};
