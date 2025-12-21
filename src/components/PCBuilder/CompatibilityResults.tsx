import React, { useState } from 'react';
import {
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  FireIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

export type CompatibilityIssue = {
  severity: "error" | "warning" | "info";
  message: string;
  details?: string;
  recommendation?: string;
  leftProductId?: string;
  leftProductName?: string;
  rightProductId?: string;
  rightProductName?: string;
  affectedComponents?: string[];
};

type Props = {
  issues: CompatibilityIssue[];
  onClose: () => void;
};

export default function CompatibilityResults({ issues, onClose }: Props) {
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  const toggleExpand = (idx: number) => {
    const newExpanded = new Set(expandedIssues);
    if (expandedIssues.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedIssues(newExpanded);
  };

  // Detect risks from message and details
  const detectRisks = (issue: CompatibilityIssue): Array<{ icon: React.ReactElement; label: string; color: string }> => {
    const text = `${issue.message} ${issue.details || ''}`.toLowerCase();
    const risks: Array<{ icon: React.ReactElement; label: string; color: string }> = [];

    if (text.includes('nóng') || text.includes('nhiệt') || text.includes('heat') || text.includes('thermal') || text.includes('throttle')) {
      risks.push({ icon: <FireIcon className="w-3.5 h-3.5" />, label: 'Quá nhiệt', color: 'text-orange-600 bg-orange-50 border-orange-200' });
    }
    if (text.includes('điện') || text.includes('năng lượng') || text.includes('power') || text.includes('lãng phí') || text.includes('hiệu suất thấp')) {
      risks.push({ icon: <BoltIcon className="w-3.5 h-3.5" />, label: 'Tốn điện', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' });
    }
    if (text.includes('tuổi thọ') || text.includes('lifespan') || text.includes('vrm') || text.includes('giảm') || text.includes('hỏng')) {
      risks.push({ icon: <ClockIcon className="w-3.5 h-3.5" />, label: 'Giảm tuổi thọ', color: 'text-red-600 bg-red-50 border-red-200' });
    }
    if (text.includes('chậm') || text.includes('hiệu suất giảm') || text.includes('performance') || text.includes('slow') || text.includes('bandwidth')) {
      risks.push({ icon: <SignalSlashIcon className="w-3.5 h-3.5" />, label: 'Giảm hiệu suất', color: 'text-purple-600 bg-purple-50 border-purple-200' });
    }
    if (text.includes('lãng phí') || text.includes('tiền') || text.includes('k-series') || text.includes('overclock') || text.includes('waste')) {
      risks.push({ icon: <CurrencyDollarIcon className="w-3.5 h-3.5" />, label: 'Lãng phí tiền', color: 'text-green-600 bg-green-50 border-green-200' });
    }

    return risks;
  };

  return (
    <div className="mt-4 bg-white/95 rounded-xl p-6 shadow-2xl w-full max-w-3xl animate-fade-in border border-gray-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BoltIcon className="w-6 h-6 text-blue-500" />
          Kết quả kiểm tra tương thích
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors font-medium"
        >
          Đóng ✕
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="bg-gradient-to-br from-green-light-6 via-green-light-7 to-green-light-8 border-2 border-green rounded-xl p-6 flex items-start gap-4 shadow-md">
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-green to-green-dark rounded-full p-3 shadow-lg">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-green-dark-2 mb-2 flex items-center gap-2">
              ✓ Hoàn hảo! 
              <span className="text-2xl">🎉</span>
            </h4>
            <p className="text-green-dark text-base leading-relaxed font-medium">
              Tất cả linh kiện đã chọn đều tương thích hoàn toàn. Bạn có thể yên tâm thêm vào giỏ hàng và thanh toán.
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-green-dark-2">
              <BoltIcon className="w-4 h-4" />
              <span className="font-semibold">Không phát hiện vấn đề nào!</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary badges */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Tóm tắt:</span>
            {issues.filter(i => i.severity === "error").length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-light-5 to-red-light-6 text-red-dark-2 text-xs font-semibold border-2 border-red shadow-sm">
                <span className="bg-gradient-to-br from-red to-red-dark rounded-full p-1">
                  <XCircleIcon className="w-3.5 h-3.5 text-white" />
                </span>
                {issues.filter(i => i.severity === "error").length} lỗi nghiêm trọng
              </span>
            )}
            {issues.filter(i => i.severity === "warning").length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-light-4 to-yellow-light-5 text-yellow-dark-2 text-xs font-semibold border-2 border-yellow-dark shadow-sm">
                <span className="bg-gradient-to-br from-yellow to-yellow-dark rounded-full p-1">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5 text-white" />
                </span>
                {issues.filter(i => i.severity === "warning").length} cảnh báo
              </span>
            )}
            {issues.filter(i => i.severity === "info").length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-light-5 to-blue-light-6 text-blue-dark-2 text-xs font-semibold border-2 border-blue shadow-sm">
                <span className="bg-gradient-to-br from-blue to-blue-dark rounded-full p-1">
                  <InformationCircleIcon className="w-3.5 h-3.5 text-white" />
                </span>
                {issues.filter(i => i.severity === "info").length} gợi ý
              </span>
            )}
          </div>

          {/* Issues list */}
          <div className="space-y-3">
            {issues.map((issue, idx) => {
              const isExpanded = expandedIssues.has(idx);
              const hasDetails = issue.details || issue.recommendation;
              const risks = detectRisks(issue);

              // Determine severity styling with softer, more readable colors
              let severityConfig = {
                bgClass: "bg-white border-l-4",
                borderClass: "border-red",
                iconBgClass: "bg-gradient-to-br from-red to-red-dark",
                textClass: "text-gray-9",
                subtextClass: "text-gray-700",
                badgeClass: "bg-red-50 text-red-700 border-red-200",
                icon: <XCircleIcon className="w-5 h-5 text-white" />,
                label: "LỖI",
                badgeIcon: "🚫"
              };

              if (issue.severity === "warning") {
                severityConfig = {
                  bgClass: "bg-white border-l-4",
                  borderClass: "border-yellow",
                  iconBgClass: "bg-gradient-to-br from-yellow to-yellow-dark",
                  textClass: "text-gray-9",
                  subtextClass: "text-gray-700",
                  badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
                  icon: <ExclamationTriangleIcon className="w-5 h-5 text-white" />,
                  label: "CẢNH BÁO",
                  badgeIcon: "⚠️"
                };
              } else if (issue.severity === "info") {
                severityConfig = {
                  bgClass: "bg-white border-l-4",
                  borderClass: "border-blue",
                  iconBgClass: "bg-gradient-to-br from-blue to-blue-dark",
                  textClass: "text-gray-9",
                  subtextClass: "text-gray-700",
                  badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
                  icon: <InformationCircleIcon className="w-5 h-5 text-white" />,
                  label: "GỢI Ý",
                  badgeIcon: "💡"
                };
              }

              return (
                <div
                  key={idx}
                  className={`${severityConfig.bgClass} ${severityConfig.borderClass} rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md border border-gray-200`}
                >
                  {/* Issue Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 ${severityConfig.iconBgClass} rounded-lg p-2 shadow-sm`}>
                        {severityConfig.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Severity badge and affected components */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${severityConfig.badgeClass}`}>
                            {severityConfig.badgeIcon} {severityConfig.label}
                          </span>
                          {issue.affectedComponents && issue.affectedComponents.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {issue.affectedComponents.map((comp, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 border border-gray-300 text-xs font-medium text-gray-600"
                                >
                                  {comp.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Risk tags */}
                        {risks.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            {risks.map((risk, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${risk.color}`}
                              >
                                {risk.icon}
                                {risk.label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Main message */}
                        <p className={`text-sm font-semibold ${severityConfig.textClass} leading-snug mb-1`}>
                          {issue.message}
                        </p>

                        {/* Product names if available */}
                        {(issue.leftProductName || issue.rightProductName) && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 flex-wrap">
                            {issue.leftProductName && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-50 rounded border border-gray-200 font-medium">
                                {issue.leftProductName}
                              </span>
                            )}
                            {issue.leftProductName && issue.rightProductName && (
                              <span className="text-gray-400">×</span>
                            )}
                            {issue.rightProductName && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-50 rounded border border-gray-200 font-medium">
                                {issue.rightProductName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expand button */}
                      {hasDetails && (
                        <button
                          onClick={() => toggleExpand(idx)}
                          className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                          title={isExpanded ? "Thu gọn" : "Xem chi tiết"}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && hasDetails && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3 bg-gray-50/50">
                      {/* Details section */}
                      {issue.details && (
                        <div className="bg-gradient-to-br from-yellow-light-3 to-yellow-light-4 border border-yellow rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <InformationCircleIcon className="w-4 h-4 text-yellow-dark-2" />
                            <h5 className="text-sm font-bold text-yellow-dark-3">Chi tiết kỹ thuật:</h5>
                          </div>
                          <p className="text-sm text-gray-8 leading-relaxed whitespace-pre-line">
                            {issue.details}
                          </p>
                        </div>
                      )}

                      {/* Recommendation section */}
                      {issue.recommendation && (
                        <div className="bg-gradient-to-br from-green-light-6 to-green-light-7 border border-green rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <LightBulbIcon className="w-4 h-4 text-green-dark" />
                            <h5 className="text-sm font-bold text-green-dark-2">💡 Giải pháp đề xuất:</h5>
                          </div>
                          <p className="text-sm text-gray-8 leading-relaxed whitespace-pre-line font-medium">
                            {issue.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
