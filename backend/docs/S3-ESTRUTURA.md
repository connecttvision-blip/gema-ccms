# ESTRUTURA S3 — GEMA

## 1. Estratégia de Bucket

Padrão:
gema-{ambiente}-{regiao}

Exemplos:
gema-prod-sa-east-1
gema-dev-sa-east-1

---

## 2. Estrutura de Pastas (Multi-tenant)

tenant/{tenantId}/
    assets/
    os/
    estoque/
    anexos/

Exemplo:
tenant/2bd5763e-f311-41fe-9115-ef134ef7d25e/assets/

---

## 3. Estratégia de Versionamento

- Versionamento ativado no bucket
- Nunca sobrescrever arquivos críticos
- Utilizar sufixo timestamp quando necessário

---

## 4. Política Técnica

- Acesso apenas via backend
- Nunca expor credenciais no frontend
- Upload via presigned URL (futuro)

---

## Gate 6

Infraestrutura de arquivos definida.