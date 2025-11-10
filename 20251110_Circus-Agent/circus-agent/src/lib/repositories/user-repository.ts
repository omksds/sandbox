import { prisma } from "@/lib/prisma";
import type { AgentUser } from "@/lib/domain/types";
import type { Agent } from "@prisma/client";

/**
 * PrismaのAgentをAgentUser型に変換
 */
function toAgentUser(agent: Agent): AgentUser {
  return {
    id: agent.id,
    email: agent.email,
    name: agent.name,
    organization: agent.organization,
    role: agent.role,
  };
}

export const userRepository = {
  /**
   * メールアドレスでユーザーを検索（認証用）
   * 注意: パスワードはハッシュ化されたものをそのまま返す
   */
  async findByEmail(
    email: string,
  ): Promise<(AgentUser & { password: string }) | null> {
    const agent = await prisma.agent.findUnique({
      where: { email },
    });

    if (!agent) return null;

    // 実際の実装では、パスワードハッシュをそのまま返す
    // NextAuthのCredentialsプロバイダーで比較する
    return {
      ...toAgentUser(agent),
      password: "TODO: implement password field in Agent model",
    };
  },

  /**
   * IDでユーザーを取得
   */
  async findById(id: string): Promise<AgentUser | null> {
    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) return null;
    return toAgentUser(agent);
  },

  /**
   * ユーザーを作成
   */
  async create(data: {
    email: string;
    name: string;
    organization: string;
    phone?: string;
  }): Promise<AgentUser> {
    const agent = await prisma.agent.create({
      data,
    });
    return toAgentUser(agent);
  },
};
