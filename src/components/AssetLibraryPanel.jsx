import { AlertTriangle, ImagePlus, Trash2, X } from 'lucide-react';

export default function AssetLibraryPanel({ library }) {
  if (!library.selectedDateKey) return null;

  return (
    <div className="asset-overlay" role="dialog" aria-modal="true" aria-label="Bildbibliotek">
      <div className="asset-panel panel">
        <div className="asset-header">
          <div>
            <h3>Bildbibliotek</h3>
            <p>
              {library.selectedDay
                ? `Välj bild för ${library.selectedDay.weekdayLabel} ${library.selectedDay.dayNum}`
                : 'Välj en bild'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => library.setSelectedDateKey(null)}
            aria-label="Stäng bildbibliotek"
          >
            <X size={16} />
          </button>
        </div>

        {library.uploadError && (
          <div className="ai-error-banner" role="alert">
            <AlertTriangle size={16} /> {library.uploadError}
          </div>
        )}

        <label className="upload-dropzone">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) library.addImage(file);
              event.target.value = '';
            }}
          />
          <ImagePlus size={18} />
          <span>
            {library.isUploading ? 'Laddar upp till Cloudinary...' : 'Lägg till bild från datorn'}
          </span>
        </label>

        <div className="asset-grid">
          {library.assetLibrary.map((item) => (
            <article key={item.id} className="asset-card">
              <img
                src={item.url}
                alt={item.name || 'Uppladdad bild'}
                loading="lazy"
                className={item.url.startsWith('data:') ? 'asset-img-preview' : ''}
              />
              <div className="asset-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => library.assignImageToDay(library.selectedDateKey, item.url)}
                  disabled={item.url.startsWith('data:')}
                >
                  {item.url.startsWith('data:') ? 'Laddar...' : 'Använd'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => library.removeImage(item.id)}
                  aria-label={`Ta bort ${item.name || 'bild'}`}
                  disabled={item.url.startsWith('data:')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
