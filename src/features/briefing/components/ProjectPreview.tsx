/** Miniaturas educativas do Briefing, independentes das cenas da Landing. */
export function ProjectPreview({ kind }: { kind: number }) {
  return (
    <span className={`project-preview preview-${kind}`} aria-hidden="true">
      <span className="preview-browser">
        <i />
        <i />
        <i />
      </span>

      {kind === 0 && (
        <span className="preview-offer">
          <span>
            <small>UM SERVIÇO, UM OBJETIVO</small>
            <strong>
              Sua oferta
              <br />
              em destaque.
            </strong>
            <em>Conheça a proposta →</em>
          </span>

          <span className="preview-offer-panel">
            01<span>Benefício<br />em primeiro lugar.</span>
          </span>
        </span>
      )}

      {kind === 1 && (
        <span className="preview-company">
          <span className="preview-company-nav">
            Seu negócio <small>Sobre · Serviços · Contato</small>
          </span>
          <strong>
            Uma presença
            <br />
            que inspira confiança.
          </strong>
          <span className="preview-company-sections">
            <i>Quem somos</i>
            <i>O que fazemos</i>
            <i>Fale conosco</i>
          </span>
        </span>
      )}

      {kind === 2 && (
        <span className="preview-catalog">
          <strong>Explore a coleção.</strong>
          <span className="preview-products">
            {['Objeto 01', 'Objeto 02', 'Objeto 03'].map((name, index) => (
              <span key={name}>
                <i className={`preview-product-${index}`} />
                <small>{name}</small>
              </span>
            ))}
          </span>
          <em>Produtos organizados para consultar →</em>
        </span>
      )}

      {kind === 3 && (
        <span className="preview-portfolio">
          <span>
            <small>SEU NOME · SEU TRABALHO</small>
            <strong>
              Ideias que
              <br />
              ganham forma.
            </strong>
          </span>
          <span className="preview-work">
            <i>Projeto<br />selecionado</i>
            <i>Estudo<br />criativo</i>
          </span>
        </span>
      )}
    </span>
  )
}
