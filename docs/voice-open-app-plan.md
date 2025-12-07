# Plan: Voice-Activated App Opening for iPet

## Summary
Thêm tính năng cho pet có thể mở ứng dụng macOS qua voice command với confirmation dialog.

**Approach**: Frontend Pattern Matching (không dùng AI để parse intent)

```
User nói "mở Safari"
  → Frontend detect pattern (regex)
  → Validate app trong allowed list
  → Show confirmation dialog
  → User nhấn Y/Enter → Mở app
  → Gemini trả lời cute như bình thường
```

---

## Files to Modify/Create

| File | Type | Description |
|------|------|-------------|
| `src-tauri/src/lib.rs` | Modify | Add `open_app` Tauri command |
| `src/types/settings.ts` | Modify | Add VoiceCommandConfig types |
| `src/services/VoiceCommandService.ts` | Modify | Add open app patterns |
| `src/services/AppLauncherService.ts` | **NEW** | Invoke Tauri |
| `src/components/ConfirmDialog/` | **NEW** | Confirmation UI |
| `src/hooks/useVoiceInput.ts` | Modify | Integrate command detection |
| `src/components/Pet/Pet.tsx` | Modify | Show ConfirmDialog |
| `src/components/Settings/Settings.tsx` | Modify | Add app list config |

---

## 1. Backend (Rust)

**src-tauri/src/lib.rs**

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenAppConfig {
    pub enabled: bool,
    pub allowed_apps: Vec<AllowedApp>,
    pub require_confirmation: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AllowedApp {
    pub name: String,           // "Safari"
    pub bundle_id: String,      // "com.apple.Safari"
    pub aliases: Vec<String>,   // ["safari", "sa fa ri"]
}

// Update AppSettings
pub struct AppSettings {
    // ... existing fields
    #[serde(default = "default_open_app_config")]
    pub open_app: OpenAppConfig,
}

#[tauri::command]
fn open_app(app_name: String, bundle_id: String) -> Result<String, String> {
    let sanitized = sanitize_app_name(&app_name)?;

    let output = std::process::Command::new("open")
        .arg("-b")
        .arg(&bundle_id)
        .output()
        .map_err(|e| format!("Failed to open app: {}", e))?;

    if output.status.success() {
        Ok(format!("Opened {}", sanitized))
    } else {
        Err(format!("Failed to open {}", sanitized))
    }
}

fn sanitize_app_name(name: &str) -> Result<String, String> {
    let sanitized: String = name.chars()
        .filter(|c| c.is_alphanumeric() || *c == ' ' || *c == '.' || *c == '-')
        .collect();
    if sanitized.is_empty() {
        return Err("Invalid app name".to_string());
    }
    Ok(sanitized)
}
```

---

## 2. Types (TypeScript)

**src/types/settings.ts**

```typescript
export interface AllowedApp {
  name: string;
  bundle_id: string;
  aliases: string[];
}

export interface OpenAppConfig {
  enabled: boolean;
  allowed_apps: AllowedApp[];
  require_confirmation: boolean;
}

// Add to AppSettings
open_app: OpenAppConfig;

// Add to DEFAULT_SETTINGS
open_app: {
  enabled: true,
  require_confirmation: true,
  allowed_apps: [
    { name: 'Safari', bundle_id: 'com.apple.Safari', aliases: ['safari'] },
    { name: 'Spotify', bundle_id: 'com.spotify.client', aliases: ['spotify'] },
    { name: 'Notes', bundle_id: 'com.apple.Notes', aliases: ['notes', 'ghi chu'] },
    { name: 'Calculator', bundle_id: 'com.apple.calculator', aliases: ['calculator', 'may tinh'] },
  ],
},
```

---

## 3. Update VoiceCommandService

**src/services/VoiceCommandService.ts**

Add new command type and patterns:

```typescript
// Add to CommandAction type
| { type: 'open_app'; appName: string; matchedApp: AllowedApp }

// Add open app patterns
const OPEN_APP_PATTERNS = [
  /^m[oở]\s+(.+)$/i,                    // "mở Safari"
  /^open\s+(.+)$/i,                      // "open Safari"
  /^launch\s+(.+)$/i,                    // "launch Chrome"
  /^start\s+(.+)$/i,                     // "start Notes"
  /^ch[aạ]y\s+(.+)$/i,                   // "chạy Calculator"
  /^kh[oở]i\s*[dđ][oộ]ng\s+(.+)$/i,     // "khởi động Safari"
];

// Add to parseTranscript method
static parseTranscript(transcript: string, allowedApps?: AllowedApp[]): ParseResult {
  const normalized = transcript.toLowerCase().trim();

  // Check for open app commands first (if allowedApps provided)
  if (allowedApps) {
    for (const pattern of OPEN_APP_PATTERNS) {
      const match = normalized.match(pattern);
      if (match) {
        const appQuery = match[1].trim();
        const matchedApp = this.findApp(appQuery, allowedApps);
        if (matchedApp) {
          return {
            isCommand: true,
            command: {
              id: 'open_app',
              action: { type: 'open_app', appName: matchedApp.name, matchedApp },
              category: 'system',
            },
            originalText: transcript,
          };
        }
      }
    }
  }

  // ... existing movement command checks
}

private static findApp(query: string, apps: AllowedApp[]): AllowedApp | undefined {
  const q = query.toLowerCase().replace(/\s+/g, '');
  return apps.find(app =>
    app.name.toLowerCase() === query.toLowerCase() ||
    app.aliases.some(a => a.toLowerCase().replace(/\s+/g, '') === q)
  );
}
```

---

## 4. AppLauncherService (NEW)

**src/services/AppLauncherService.ts**

```typescript
import { invoke } from '@tauri-apps/api/core';
import { AllowedApp } from '../types/settings';

export class AppLauncherService {
  static async openApp(app: AllowedApp): Promise<{ success: boolean; error?: string }> {
    try {
      await invoke('open_app', { appName: app.name, bundleId: app.bundle_id });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
```

---

## 5. ConfirmDialog (NEW)

**src/components/ConfirmDialog/ConfirmDialog.tsx**

```typescript
import { useEffect } from 'react';
import './ConfirmDialog.css';

interface Props {
  appName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ appName, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const timer = setTimeout(onCancel, 5000); // Auto-cancel after 5s
    return () => clearTimeout(timer);
  }, [onCancel]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key.toLowerCase() === 'y') onConfirm();
      else if (e.key === 'Escape' || e.key.toLowerCase() === 'n') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onConfirm, onCancel]);

  return (
    <div className="confirm-dialog">
      <span>🚀 Open {appName}?</span>
      <div>
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onCancel}>No</button>
      </div>
    </div>
  );
}
```

---

## 6. Update useVoiceInput

**src/hooks/useVoiceInput.ts**

```typescript
// Add state for pending app open
const [pendingOpenApp, setPendingOpenApp] = useState<AllowedApp | null>(null);

// In handleResult, after VoiceCommandService.parseTranscript:
if (parseResult.isCommand && parseResult.command?.action.type === 'open_app') {
  const { matchedApp } = parseResult.command.action;
  if (settings.open_app.require_confirmation) {
    setPendingOpenApp(matchedApp);
    return;
  }
  await AppLauncherService.openApp(matchedApp);
  setState('idle');
  return;
}

// Add handlers
const confirmOpenApp = async () => {
  if (pendingOpenApp) {
    await AppLauncherService.openApp(pendingOpenApp);
  }
  setPendingOpenApp(null);
};

const cancelOpenApp = () => setPendingOpenApp(null);

// Return
return { ...existing, pendingOpenApp, confirmOpenApp, cancelOpenApp };
```

---

## 7. Update Pet.tsx

```typescript
const { pendingOpenApp, confirmOpenApp, cancelOpenApp } = useVoiceInput();

// In render
{pendingOpenApp && (
  <ConfirmDialog
    appName={pendingOpenApp.name}
    onConfirm={confirmOpenApp}
    onCancel={cancelOpenApp}
  />
)}
```

---

## Voice Patterns

| Pattern | Example |
|---------|---------|
| `mở X` | "mở Safari" |
| `open X` | "open Spotify" |
| `launch X` | "launch Chrome" |
| `chạy X` | "chạy Calculator" |
| `khởi động X` | "khởi động Notes" |

---

## Default Apps

| App | Bundle ID | Aliases |
|-----|-----------|---------|
| Safari | com.apple.Safari | safari |
| Spotify | com.spotify.client | spotify |
| Notes | com.apple.Notes | notes, ghi chu |
| Calculator | com.apple.calculator | calculator, may tinh |

---

## Security

1. **Allowlist-only**: Chỉ app trong danh sách
2. **Input sanitization**: Filter ký tự đặc biệt
3. **Confirmation dialog**: Mặc định bật
4. **Bundle ID**: Dùng bundle ID thay vì app name
5. **No shell injection**: Chỉ `open -b bundle.id`

---

## Implementation Order

1. [ ] Backend: Rust structs + `open_app` command
2. [ ] Types: TypeScript settings types
3. [ ] Services: Update VoiceCommandService + create AppLauncherService
4. [ ] Components: Create ConfirmDialog
5. [ ] Hooks: Update useVoiceInput
6. [ ] Pet.tsx: Integrate ConfirmDialog
7. [ ] Settings: Add open app section

---

## Testing Checklist

- [ ] Vietnamese: "mở Safari", "mở Spotify"
- [ ] English: "open Safari", "launch Chrome"
- [ ] Confirmation dialog appears
- [ ] Enter/Y confirms và mở app
- [ ] Escape/N cancels
- [ ] Dialog auto-close sau 5s
- [ ] Unrecognized app → normal Gemini response
- [ ] Settings toggle hoạt động
- [ ] Add/remove apps trong Settings
