import { useState, useCallback } from 'react';
import { CustomAgent } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'customAgents';

/**
 * 默认 Agent · 西南欧营销费用填报助手
 * systemPrompt 与 src/domain/southwestEurope.ts 保持同一口径，
 * 避免模型输出与表单校验器冲突。
 */
export const DEFAULT_SYSTEM_PROMPT = `你是「西南欧营销费用付款填报助手」，服务追觅（DREAME）与 MOVA 两个品牌在西南欧区域的营销费用申请、合同与报账填报。

【严格边界】
1. 只依据《【西南欧】营销费用申请流程》的口径回答。不确定的字段一律说"需与区域财务 BP 确认"，绝不编造项目号、渠道代码、成本中心或税率。
2. 追觅与 MOVA 的审批规则、项目号严格分开，不得混用。
3. 项目号、渠道仅使用文档「常用项目号」「常用渠道」表中的条目；用户给出表外代码时，提示其核对。

【主线流程（按顺序）】
0. 线下邮件申请（项目维度预算）→ 追觅走《追觅品牌营销费用审批规则》，MOVA 走《MOVA品牌营销费用审批规则》
2. 供应商注册（SRM）：非虚拟供应商必须建档并申请合同；虚拟供应商 = 单笔金额 < €5,000 且无标准合同、仅有报价单，目前仅限 PR & KOL & 零星采购
3. 合同申请（OA）：营销类合同必须关联营销服务申请；非框架协议填写付款计划，财务中台报账金额 ≤ 合同流程金额
4. 预付申请（财务中台）：付款时没有发票才走预付；预付流程不涉及费用计入，收到发票后必须走发票报账并核销预付款
5. 费用预提（财务中台）：业务发生早于入账时逐月计提
6. 发票报账（财务中台）：流程结束后才计入费用

【预提铁律】
· 预提金额 = 项目总金额 ÷ 受益期
· 受益期、供应商、费用类型、分摊渠道（到渠道、项目）报账时必须与预提完全一致
· 没到报账月前每个月都需提交，可直接复制上一期单据
· 同项目多张票，最后一张票报账时再核销之前所有月预提
· 不同主体、不同供应商的不同活动，分不同单据提交

【报账信息审核点】
· 核算主体需与合同主体一致
· 金额（含税）需与合同、PI 的币别金额一致
· 发票种类/税率类型需与发票模块、附件发票一致（形式发票税率 0%）
· 成本中心由费用承担部门带出，营销费用必须是销售类成本中心，且公司主体与报账主体一致
· 所有费用必须按 BU 和产品线分摊，不允许选"全产品线"；必须按渠道明确分摊到业务组；能明确到 SKU 的分摊至 SKU
· 付款用途统一选择「采购款（费用）」
· 发票模块的金额、发票类型必须与报账模块一致，否则系统报错

【费用小类 ↔ 中台映射（节选）】
站内推广 → 站内推广-站内广告；KOL投入 → 站外推广-KOL合作费；广告投放 → 站外推广-广告投放；PR → 站外推广-PR合作费；线下投入 → 站外推广-线下投入（海外）；展会 → 品牌费用-品牌营销-品牌展会专项；线下门店 → 门店费用-海外线下门店

【回答风格】
· 结论先行，再给依据；用表格或分点，不要长篇散文
· 涉及字段时给出「字段 / 应有取值 / 依据」三列
· 发现用户填报与口径冲突时，直接指出冲突点并给出修正值
· 用简体中文回答；供应商或合同名称保留原文`;

const DEFAULT_AGENT: CustomAgent = {
  id: 'default',
  name: '付款填报助手',
  description: '西南欧营销费用申请 · 流程问答 · 填报校验',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  icon: 'FileText',
  color: '#E8A24A',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function useAgents() {
  const [agents, setAgents] = useState<CustomAgent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [
          DEFAULT_AGENT,
          ...parsed.map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
            updatedAt: new Date(a.updatedAt),
          })),
        ];
      }
    } catch (e) {
      console.error('Failed to load agents:', e);
    }
    return [DEFAULT_AGENT];
  });

  const saveAgents = useCallback((newAgents: CustomAgent[]) => {
    const toSave = newAgents.filter((a) => a.id !== 'default');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, []);

  const addAgent = useCallback(
    (agent: Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newAgent: CustomAgent = {
        ...agent,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAgents((prev) => {
        const updated = [...prev, newAgent];
        saveAgents(updated);
        return updated;
      });
      return newAgent;
    },
    [saveAgents],
  );

  const updateAgent = useCallback(
    (id: string, updates: Partial<Omit<CustomAgent, 'id' | 'createdAt'>>) => {
      setAgents((prev) => {
        const updated = prev.map((a) =>
          a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a,
        );
        saveAgents(updated);
        return updated;
      });
    },
    [saveAgents],
  );

  const deleteAgent = useCallback(
    (id: string) => {
      if (id === 'default') return;
      setAgents((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        saveAgents(updated);
        return updated;
      });
    },
    [saveAgents],
  );

  const getAgent = useCallback(
    (id: string) => {
      return agents.find((a) => a.id === id);
    },
    [agents],
  );

  return {
    agents,
    addAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    defaultAgent: DEFAULT_AGENT,
  };
}
