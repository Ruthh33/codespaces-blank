'use client';

import { useEffect, useRef } from 'react';
import type { SessionInfo } from '../../types/SessionInfo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const FB: any;

interface FBL4BLauncherProps {
  appId: string;
  appName?: string;
  esConfig: string;
  onClickFbl4b: () => boolean;
  onBannerInfoChange: (info: string) => void;
  onLastEventDataChange: (data: unknown) => void;
  onSaveToken: (code: string, sessionInfo: SessionInfo) => void;
  onQuickLaunch?: (fn: () => void) => void;
}

let sessionInfoOuter: SessionInfo | null = null;
let codeOuter: string | null = null;

export default function FBL4BLauncher({
  appId,
  esConfig,
  onClickFbl4b,
  onBannerInfoChange,
  onLastEventDataChange,
  onSaveToken,
  onQuickLaunch,
}: FBL4BLauncherProps) {
  const esInProgress = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupWindowRef = useRef<Window | null>(null);

  const stopPolling = () => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const clearEsState = () => {
    esInProgress.current = false;
    popupWindowRef.current = null;
    stopPolling();
  };

  const fbLoginCallback = (response: { authResponse?: { code: string } }) => {
    clearEsState();
    if (response.authResponse) {
      const code = response.authResponse.code;
      codeOuter = code;
      if (sessionInfoOuter && codeOuter) {
        onSaveToken(codeOuter, sessionInfoOuter);
      }
    } else {
      onBannerInfoChange('');
    }
  };

  const launchWhatsAppSignup = () => {
    const blocked = onClickFbl4b();
    if (blocked) return;
    if (typeof FB === 'undefined') {
      onBannerInfoChange('Facebook SDK is still loading. Please try again in a moment.');
      return;
    }
    const esConfigJson = JSON.parse(esConfig);
    onBannerInfoChange('ES Started...');
    onLastEventDataChange(null);
    sessionInfoOuter = null;
    codeOuter = null;
    esInProgress.current = true;
    popupWindowRef.current = null;

    const originalWindowOpen = window.open;
    window.open = function (...args) {
      const popup = originalWindowOpen.apply(window, args);
      if (popup) {
        popupWindowRef.current = popup;
      }
      window.open = originalWindowOpen;
      return popup;
    };

    FB.login(fbLoginCallback, esConfigJson);

    stopPolling();
    pollTimerRef.current = setInterval(() => {
      if (!esInProgress.current) {
        stopPolling();
        return;
      }
      const popup = popupWindowRef.current;
      if (popup && popup.closed) {
        clearEsState();
        onBannerInfoChange('');
      }
    }, 500);
  };

  if (onQuickLaunch) {
    onQuickLaunch(launchWhatsAppSignup);
  }

  useEffect(() => {
    const initFB = () => {
      FB.init({
        appId: appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v24.0',
      });
    };

    if (typeof FB !== 'undefined') {
      initFB();
    } else {
      (window as any).fbAsyncInit = initFB;
    }

    const cb = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        onLastEventDataChange(data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.data && data.data.current_step) {
            clearEsState();
            onBannerInfoChange('');
          } else {
            const sessionInfo: SessionInfo = data;
            sessionInfoOuter = sessionInfo;
            if (sessionInfoOuter && codeOuter) {
              onSaveToken(codeOuter, sessionInfo);
            }
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', cb);
    return () => {
      window.removeEventListener('message', cb);
      stopPolling();
    };
  }, [appId, onBannerInfoChange, onLastEventDataChange, onSaveToken]);

  return (
    <button
      onClick={launchWhatsAppSignup}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white text-sm font-semibold rounded-full hover:bg-[#1565C0] transition-all shadow-[0_4px_14px_rgba(24,119,242,0.4)] hover:shadow-[0_6px_20px_rgba(24,119,242,0.55)] hover:-translate-y-px"
    >
      Launch Embedded Signup
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </button>
  );
}
