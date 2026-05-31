import { icon } from '../../core/icons';

// Base32 (RFC 4648)
const B32_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(bytes: Uint8Array): string {
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    result += B32_ALPHA[parseInt(chunk, 2)];
  }
  const pad = (8 - (result.length % 8)) % 8;
  return result + '='.repeat(pad);
}
function base32Decode(str: string): Uint8Array {
  const clean = str.toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (const c of clean) {
    const idx = B32_ALPHA.indexOf(c);
    if (idx === -1) throw new Error(`无效字符: ${c}`);
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

// Base58 (Bitcoin alphabet)
const B58_ALPHA = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58Encode(bytes: Uint8Array): string {
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = '';
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) result += '1';
  for (let i = digits.length - 1; i >= 0; i--) result += B58_ALPHA[digits[i]];
  return result;
}
function base58Decode(str: string): Uint8Array {
  const bytes = [0];
  for (const c of str) {
    const idx = B58_ALPHA.indexOf(c);
    if (idx === -1) throw new Error(`无效字符: ${c}`);
    let carry = idx;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < str.length && str[i] === '1'; i++) bytes.push(0);
  return new Uint8Array(bytes.reverse());
}

// Base62
const B62_ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function base62Encode(bytes: Uint8Array): string {
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 62;
      carry = (carry / 62) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 62);
      carry = (carry / 62) | 0;
    }
  }
  let result = '';
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) result += '0';
  for (let i = digits.length - 1; i >= 0; i--) result += B62_ALPHA[digits[i]];
  return result;
}
function base62Decode(str: string): Uint8Array {
  const bytes = [0];
  for (const c of str) {
    let idx: number;
    if (c >= '0' && c <= '9') idx = c.charCodeAt(0) - 48;
    else if (c >= 'A' && c <= 'Z') idx = c.charCodeAt(0) - 55;
    else if (c >= 'a' && c <= 'z') idx = c.charCodeAt(0) - 61;
    else throw new Error(`无效字符: ${c}`);
    let carry = idx;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 62;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < str.length && str[i] === '0'; i++) bytes.push(0);
  return new Uint8Array(bytes.reverse());
}

function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

type BaseVariant = 'base32' | 'base58' | 'base62';

const encoders: Record<BaseVariant, (b: Uint8Array) => string> = {
  base32: base32Encode, base58: base58Encode, base62: base62Encode,
};
const decoders: Record<BaseVariant, (s: string) => Uint8Array> = {
  base32: base32Decode, base58: base58Decode, base62: base62Decode,
};

export default {
  id: 'base-x',
  name: 'BaseX 编解码器',
  icon: 'binary',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/encoding" class="tool-page-back">${icon('binary')} 编码解码</a>
          <h1 style="font: var(--text-headline-md);">BaseX 编解码器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">支持 Base32 / Base58 / Base62 编解码</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">编码类型</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer;">
                <input type="radio" name="bx-variant" value="base32" checked style="accent-color: var(--color-primary);" />
                <span>Base32 <small style="color: var(--color-on-surface-variant);">(RFC 4648)</small></span>
              </label>
              <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer;">
                <input type="radio" name="bx-variant" value="base58" style="accent-color: var(--color-primary);" />
                <span>Base58 <small style="color: var(--color-on-surface-variant);">(Bitcoin)</small></span>
              </label>
              <label style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer;">
                <input type="radio" name="bx-variant" value="base62" style="accent-color: var(--color-primary);" />
                <span>Base62</span>
              </label>
            </div>
          </div>
          <div class="tool-field">
            <label class="tool-label">输入文本</label>
            <textarea id="bx-input" class="tool-textarea" rows="8" placeholder="输入需要编码的文本或已编码的字符串..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="bx-encode">编码</button>
            <button class="btn btn-primary" id="bx-decode">解码</button>
            <button class="btn btn-secondary" id="bx-clear">清空</button>
          </div>
          <div class="tool-field">
            <label class="tool-label">结果</label>
            <textarea id="bx-output" class="tool-textarea" rows="8" readonly placeholder="结果将显示在这里..."></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="bx-copy">${icon('content_copy')} 复制结果</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#bx-input') as HTMLTextAreaElement;
    const output = container.querySelector('#bx-output') as HTMLTextAreaElement;

    function getVariant(): BaseVariant {
      return (container.querySelector('input[name="bx-variant"]:checked') as HTMLInputElement).value as BaseVariant;
    }

    container.querySelector('#bx-encode')!.addEventListener('click', () => {
      try {
        const variant = getVariant();
        const bytes = textToBytes(input.value);
        output.value = encoders[variant](bytes);
      } catch (e: any) {
        output.value = '编码失败: ' + e.message;
      }
    });

    container.querySelector('#bx-decode')!.addEventListener('click', () => {
      try {
        const variant = getVariant();
        const bytes = decoders[variant](input.value.trim());
        output.value = bytesToText(bytes);
      } catch (e: any) {
        output.value = '解码失败: ' + e.message;
      }
    });

    container.querySelector('#bx-clear')!.addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#bx-copy')!.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value);
    });
  },
};
