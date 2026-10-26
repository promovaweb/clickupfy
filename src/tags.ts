/** Gestão de tags do Space com preservação das cores ao renomear ou excluir. */
import { z } from "zod";
import type { ClickUpClient } from "./clickup.js";
import { findOperation } from "./api/catalog.js";
import { executeOperation } from "./api/execute.js";
export const tagNameSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.trim().length > 0 && value !== "." && value !== "..",
    "Informe um nome de tag válido.",
  );
export const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor hexadecimal como #336699.");
export const tagDataSchema = z.object({
  name: tagNameSchema,
  foreground: colorSchema,
  background: colorSchema,
});
export const tagChangesSchema = tagDataSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Informe nome ou cores para atualizar.",
  );
export interface SpaceTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

/** Lista o catálogo do Space, independentemente das tags associadas a uma tarefa. */
export async function listSpaceTags(
  client: ClickUpClient,
  spaceId: string,
): Promise<SpaceTag[]> {
  const result = (await executeOperation(
    client,
    findOperation("GetSpaceTags"),
    { path: { space_id: spaceId } },
  )) as { tags: SpaceTag[] };
  return result.tags;
}

/** Cria uma tag com nome e duas cores obrigatórias, conforme a API. */
export async function createSpaceTag(
  client: ClickUpClient,
  spaceId: string,
  data: z.infer<typeof tagDataSchema>,
): Promise<unknown> {
  const tag = tagDataSchema.parse(data);
  return executeOperation(client, findOperation("CreateSpaceTag"), {
    path: { space_id: spaceId },
    body: {
      tag: { name: tag.name, tag_fg: tag.foreground, tag_bg: tag.background },
    },
  });
}

/** Obtém as cores atuais antes de enviar o corpo completo exigido pelo ClickUp. */
async function existingTag(
  client: ClickUpClient,
  spaceId: string,
  name: string,
): Promise<SpaceTag> {
  tagNameSchema.parse(name);
  const tag = (await listSpaceTags(client, spaceId)).find(
    (item) => item.name === name,
  );
  if (!tag) throw new Error(`Tag não encontrada no Space ${spaceId}: ${name}.`);
  return tag;
}

/** Alterações parciais preservam o nome ou as cores omitidos, mediante uma leitura prévia. */
export async function updateSpaceTag(
  client: ClickUpClient,
  spaceId: string,
  name: string,
  changes: z.infer<typeof tagChangesSchema>,
): Promise<unknown> {
  const data = tagChangesSchema.parse(changes);
  const current = await existingTag(client, spaceId, name);
  // O schema oficial de edição usa fg_color/bg_color; criação e exclusão usam tag_fg/tag_bg.
  return executeOperation(client, findOperation("EditSpaceTag"), {
    path: { space_id: spaceId, tag_name: name },
    body: {
      tag: {
        name: data.name ?? current.name,
        fg_color: data.foreground ?? current.tag_fg,
        bg_color: data.background ?? current.tag_bg,
      },
    },
  });
}

/** Exclui a tag do Space. O corpo DELETE contém a definição obtida na consulta anterior. */
export async function deleteSpaceTag(
  client: ClickUpClient,
  spaceId: string,
  name: string,
): Promise<unknown> {
  const current = await existingTag(client, spaceId, name);
  return executeOperation(client, findOperation("DeleteSpaceTag"), {
    path: { space_id: spaceId, tag_name: name },
    body: {
      tag: {
        name: current.name,
        tag_fg: current.tag_fg,
        tag_bg: current.tag_bg,
      },
    },
    confirm: true,
  });
}

/** Remove somente a associação à tarefa; preserva a tag no Space. */
export async function removeTaskTag(
  client: ClickUpClient,
  taskId: string,
  name: string,
  workspaceId?: string,
): Promise<unknown> {
  tagNameSchema.parse(name);
  return executeOperation(client, findOperation("RemoveTagFromTask"), {
    path: { task_id: taskId, tag_name: name },
    ...(workspaceId
      ? { query: { custom_task_ids: true, team_id: Number(workspaceId) } }
      : {}),
    confirm: true,
  });
}
