'use client';
import { useEffect, useRef } from 'react';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'url';
  required?: boolean;
  options?: string[];
  wide?: boolean;
  help?: string;
}

interface Props {
  open: boolean;
  kicker?: string;
  title: string;
  fields: FieldDef[];
  values: Record<string, any>;
  error?: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
}

export default function EditorDialog({ open, kicker, title, fields, values, error, saving, onClose, onSave }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current!;
    const data: Record<string, any> = {};
    fields.forEach(f => {
      const el = form.elements.namedItem(f.name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!el) return;
      if (f.type === 'checkbox') data[f.name] = (el as HTMLInputElement).checked;
      else if (f.name === 'priceCents') data[f.name] = el.value === '' ? null : Math.round(Number(el.value) * 100);
      else if (f.type === 'number') data[f.name] = el.value === '' ? null : Number(el.value);
      else data[f.name] = el.value;
    });
    onSave(data);
  }

  return (
    <div className="dialog-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog">
        <div className="dialog-head">
          <div>
            {kicker && <p className="dialog-kicker">{kicker}</p>}
            <h2 className="dialog-title">{title}</h2>
          </div>
          <button className="dialog-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="field-grid">
              {fields.map(f => (
                <div key={f.name} className={`field${f.wide ? ' field-wide' : ''}`}>
                  {f.type === 'checkbox' ? (
                    <label className="check-label">
                      <input name={f.name} type="checkbox" defaultChecked={Boolean(values[f.name])} />
                      {f.label}
                    </label>
                  ) : (
                    <>
                      <label className="field-label">{f.label}{f.required && ' *'}</label>
                      {f.type === 'select' ? (
                        <select name={f.name} defaultValue={values[f.name] || ''} required={f.required}>
                          {f.options?.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea name={f.name} defaultValue={values[f.name] || ''} required={f.required} rows={4} />
                      ) : (
                        <input
                          name={f.name}
                          type={f.name === 'priceCents' ? 'number' : f.type}
                          defaultValue={f.name === 'priceCents' && values[f.name] != null
                            ? (Number(values[f.name]) / 100).toFixed(2)
                            : (values[f.name] || '')}
                          required={f.required}
                          step={f.name === 'priceCents' ? '0.01' : undefined}
                          min={f.name === 'priceCents' ? '0' : undefined}
                        />
                      )}
                      {f.help && <span className="field-help">{f.help}</span>}
                    </>
                  )}
                </div>
              ))}
            </div>
            {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
