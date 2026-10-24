import type { LessonBlock } from '../../types/content';
import { RichText } from '../ui/RichText';
import { Callout } from '../ui/Callout';

export function BlockRenderer({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case 'text':
      return (
        <div className="block block--text">
          {block.heading && <h3>{block.heading}</h3>}
          {block.paragraphs.map((p, i) => (
            <RichText key={i} as="p" text={p} />
          ))}
        </div>
      );

    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <div className="block block--list">
          {block.heading && <h3>{block.heading}</h3>}
          <List className="prose-list">
            {block.items.map((item, i) => (
              <li key={i}>
                <RichText text={item} />
              </li>
            ))}
          </List>
        </div>
      );
    }

    case 'example':
      return (
        <figure className="block example">
          <figcaption className="example__head">
            <span className="example__tag">Contoh</span>
            <span className="example__title">{block.heading}</span>
          </figcaption>
          {block.caption && <p className="example__caption">{block.caption}</p>}
          <dl className="example__lines">
            {block.lines.map((line, i) => (
              <div key={i} className="example__line">
                {line.label && <dt className="example__label">{line.label}</dt>}
                <dd className="example__content">
                  <RichText as="p" className="example__en" text={line.en} />
                  {line.note && <p className="example__note">{line.note}</p>}
                </dd>
              </div>
            ))}
          </dl>
        </figure>
      );

    case 'compare':
      return (
        <div className="block compare">
          {block.heading && <h3>{block.heading}</h3>}
          <ul className="compare__list">
            {block.items.map((item, i) => (
              <li key={i} className="compare__item">
                <div className="compare__cell compare__cell--weak">
                  <span className="compare__label">{block.weakLabel ?? 'Asas'}</span>
                  <p lang="en">{item.weak}</p>
                </div>
                <div className="compare__cell compare__cell--strong">
                  <span className="compare__label">{block.strongLabel ?? 'Lebih baik'}</span>
                  <p lang="en">{item.strong}</p>
                </div>
                <p className="compare__why">
                  <strong>Mengapa: </strong>
                  {item.why}
                </p>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'keyterms':
      return (
        <div className="block keyterms">
          <h3 className="keyterms__heading">
            <span className="keyterms__tag">Rujukan penting</span>
            {block.heading}
          </h3>
          <dl className="keyterms__list">
            {block.items.map((item, i) => (
              <div key={i} className="keyterms__item">
                <dt lang="en">{item.term}</dt>
                <dd>
                  <p className="keyterms__meaning">{item.meaning}</p>
                  {item.example && (
                    <p className="keyterms__example" lang="en">
                      e.g. {item.example}
                    </p>
                  )}
                  {item.note && <p className="keyterms__note">{item.note}</p>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case 'callout':
      return (
        <Callout tone={block.tone} title={block.title}>
          <RichText as="p" text={block.body} />
        </Callout>
      );

    case 'table':
      return (
        <div className="block block--table">
          {block.heading && <h3>{block.heading}</h3>}
          <div className="table-wrap" tabIndex={0} role="region" aria-label={block.heading ?? 'Jadual'}>
            <table className="table">
              <thead>
                <tr>
                  {block.columns.map((c, i) => (
                    <th key={i} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) =>
                      ci === 0 ? (
                        <th key={ci} scope="row">
                          <RichText text={cell} />
                        </th>
                      ) : (
                        <td key={ci}>
                          <RichText text={cell} />
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
  }
}
