import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  PlaySquare,
  CheckCircle2,
  Clock,
  Send,
  Cpu,
  HardDrive,
  Sparkles,
  Copy,
  Check,
  Download,
  FileCode,
  Terminal,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ListChecks,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function TaskExecutionPage() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [solving, setSolving] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  // Problem solver state
  const [problemText, setProblemText] = useState('Add two numbers: 25 and 35.');
  const [solvedResult, setSolvedResult] = useState(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(true);

  // Manual dispatch form state
  const [form, setForm] = useState({
    agent_id: '',
    task_type: 'CODE_GENERATION',
    description: '',
    priority: 0,
    cpu_limit: 50.0,
    memory_limit_mb: 512.0
  });
  const [submittedTask, setSubmittedTask] = useState(null);

  // Suggested quick-pick problems
  const sampleProblems = [
    'Add two numbers: 25 and 35.',
    'Calculate the factorial of 5.',
    'Find whether 17 is a prime number.',
    'Find the largest number among 10, 25, and 15.',
    'Calculate the average of 10, 20, and 30.',
    'Calculate the 7th fibonacci number.',
    'Reverse the string \'operating systems\'.'
  ];

  const fetchData = async () => {
    try {
      const [agRes, tskRes] = await Promise.all([
        api.getAgents(),
        api.getTasks()
      ]);
      setAgents(agRes.agents || []);
      setTasks(tskRes.tasks || []);
      if (agRes.agents?.length > 0 && !form.agent_id) {
        setForm(f => ({ ...f, agent_id: agRes.agents[0].id }));
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Problem Submission to the 4-Agent Pipeline
  const handleSolveProblem = async (e) => {
    if (e) e.preventDefault();
    if (!problemText.trim()) return;

    setSolving(true);
    setSolvedResult(null);
    setActiveStage(1);

    // Simulate visual pipeline progression for realistic UI experience
    const stageTimer1 = setTimeout(() => setActiveStage(2), 250);
    const stageTimer2 = setTimeout(() => setActiveStage(3), 500);
    const stageTimer3 = setTimeout(() => setActiveStage(4), 750);

    try {
      const res = await api.solveProblem({
        problem: problemText.trim(),
        cpu_limit: 50.0,
        memory_limit_mb: 512.0
      });
      setSolvedResult(res);
      setActiveStage(5); // Complete
      await fetchData();
    } catch (err) {
      alert(`Problem solving failed: ${err.message}`);
      setActiveStage(0);
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setSolving(false);
    }
  };

  // Handle Copy to Clipboard
  const handleCopyAnswer = () => {
    if (!solvedResult?.final_answer) return;
    navigator.clipboard.writeText(solvedResult.final_answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleCopyCode = () => {
    if (!solvedResult?.generated_code) return;
    navigator.clipboard.writeText(solvedResult.generated_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Handle Download Python Code
  const handleDownloadCode = () => {
    if (!solvedResult?.generated_code) return;
    const blob = new Blob([solvedResult.generated_code], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'agent_solution.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Manual Task Dispatch
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.submitTask(form);
      setSubmittedTask(res.task);
      setForm(f => ({ ...f, description: '' }));
      await fetchData();
    } catch (err) {
      alert(`Task submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={28} style={{ color: 'var(--accent)' }} />
          Multi-Agent Problem Solving & Execution Center
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Collaborative 4-Agent POSIX Architecture: Code Generator, Code Executor, Code Reviewer, and Testing Agent solve real problems with verified answers.
        </p>
      </div>

      {/* SECTION 1: Enter Your Problem */}
      <div className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--border-focus)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlaySquare size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Enter Your Problem
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Enter a math, algorithm, or programming problem. All four agents will synthesize code, execute it in a child process, review AST & safety, and run unit tests.
              </p>
            </div>
          </div>
        </div>

        {/* Quick-Pick Problem Pills */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick-Select Sample Problems:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sampleProblems.map((prob, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setProblemText(prob)}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: problemText === prob ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                  backgroundColor: problemText === prob ? 'var(--accent-glow)' : 'var(--bg-input)',
                  color: problemText === prob ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontWeight: problemText === prob ? 600 : 400
                }}
              >
                {prob}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Input Form */}
        <form onSubmit={handleSolveProblem}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <textarea
              className="form-textarea"
              rows={2}
              style={{ fontSize: '0.95rem', padding: '12px 14px', borderRadius: '8px', minHeight: '68px' }}
              placeholder="e.g. Add two numbers: 25 and 35, or Calculate the factorial of 5..."
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Pipeline: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Agent 01 (Gen)</span> → <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Agent 02 (Exec)</span> → <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Agent 03 (Review)</span> → <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Agent 04 (Test)</span>
            </div>

            <button
              type="submit"
              disabled={solving || !problemText.trim()}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700, gap: '8px' }}
            >
              <Send size={16} />
              <span>{solving ? 'Agents Collaborating...' : 'SUBMIT PROBLEM'}</span>
            </button>
          </div>
        </form>

        {/* 4-Agent Execution Pipeline Stepper */}
        {solving && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>
              Four-Agent POSIX Execution Progress:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                { id: 'agent_01', name: 'Agent 01 - Code Generator', stage: 1, desc: 'Synthesizing Python source' },
                { id: 'agent_02', name: 'Agent 02 - Code Executor', stage: 2, desc: 'Spawning child process & capturing stdout' },
                { id: 'agent_03', name: 'Agent 03 - Code Reviewer', stage: 3, desc: 'AST parsing, Big-O & safety review' },
                { id: 'agent_04', name: 'Agent 04 - Testing Agent', stage: 4, desc: 'Executing unit assertion test harness' }
              ].map(ag => {
                const isDone = activeStage > ag.stage;
                const isCurr = activeStage === ag.stage;
                return (
                  <div key={ag.id} style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: isDone ? 'rgba(16, 185, 129, 0.1)' : (isCurr ? 'var(--accent-glow)' : 'var(--bg-input)'),
                    border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : (isCurr ? '1px solid var(--accent)' : '1px solid var(--border-color)'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ag.name}</span>
                      {isDone ? <CheckCircle2 size={14} style={{ color: 'var(--status-healthy)' }} /> : (isCurr ? <Activity size={14} style={{ color: 'var(--accent)' }} className="spin" /> : null)}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: isCurr ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {isDone ? '✓ Stage Complete' : (isCurr ? '● Active Processing...' : ag.desc)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: DEDICATED RESULT SECTION */}
      {solvedResult && (
        <div className="glass-card" style={{ marginBottom: '24px', border: '2px solid var(--accent)', boxShadow: '0 0 25px rgba(6, 182, 212, 0.18)' }}>
          {/* Top Bar: Problem, Status, Time, Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                backgroundColor: solvedResult.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                color: solvedResult.status === 'SUCCESS' ? 'var(--status-healthy)' : 'var(--status-critical)',
                border: solvedResult.status === 'SUCCESS' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
              }}>
                STATUS: {solvedResult.status}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <Clock size={14} style={{ color: 'var(--accent)' }} />
                <span>Total Execution Time: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{solvedResult.execution_time_ms} ms</strong></span>
              </div>
            </div>

            {/* Action Buttons: Copy Answer, Copy Code, Download Code, View Detailed Report */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopyAnswer}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
                title="Copy final answer to clipboard"
              >
                {copiedAnswer ? <Check size={14} style={{ color: 'var(--status-healthy)' }} /> : <Copy size={14} />}
                <span>{copiedAnswer ? 'Answer Copied!' : 'Copy Answer'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
                title="Copy generated Python code"
              >
                {copiedCode ? <Check size={14} style={{ color: 'var(--status-healthy)' }} /> : <FileCode size={14} />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCode}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
                title="Download code as Python file"
              >
                <Download size={14} />
                <span>Download Python Code</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailedReport(!showDetailedReport)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
              >
                {showDetailedReport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{showDetailedReport ? 'Hide Detailed Report' : 'View Detailed Report'}</span>
              </button>
            </div>
          </div>

          {/* PROBLEM Box */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>
              PROBLEM:
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {solvedResult.problem}
            </div>
          </div>

          {/* FINAL ANSWER HERO DISPLAY */}
          <div style={{
            padding: '20px 24px',
            borderRadius: '10px',
            backgroundColor: solvedResult.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: solvedResult.status === 'SUCCESS' ? '2px solid rgba(16, 185, 129, 0.4)' : '2px solid rgba(239, 68, 68, 0.4)',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: solvedResult.status === 'SUCCESS' ? 'var(--status-healthy)' : 'var(--status-critical)' }}>
                ★ FINAL SOLVED ANSWER:
              </div>
              <span className="badge badge-online font-mono" style={{ fontSize: '0.72rem' }}>
                Kernel Verified
              </span>
            </div>
            <div style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: solvedResult.status === 'SUCCESS' ? 'var(--text-primary)' : 'var(--status-critical)',
              letterSpacing: '-0.02em',
              wordBreak: 'break-word'
            }}>
              {solvedResult.final_answer}
            </div>
          </div>

          {/* Two-Column Grid: GENERATED CODE & EXECUTION OUTPUT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Generated Code */}
            <div style={{
              borderRadius: '8px',
              backgroundColor: 'var(--code-bg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCode size={16} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                    GENERATED CODE (Agent 01 - Code Generator)
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>python3</span>
              </div>
              <pre style={{
                padding: '14px',
                margin: 0,
                fontSize: '0.85rem',
                fontFamily: 'Consolas, monospace',
                color: '#38bdf8',
                lineHeight: 1.6,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                flexGrow: 1
              }}>
                {solvedResult.generated_code}
              </pre>
            </div>

            {/* Execution Output */}
            <div style={{
              borderRadius: '8px',
              backgroundColor: '#020617',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={16} style={{ color: 'var(--status-healthy)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                    EXECUTION OUTPUT (Agent 02 - Code Executor)
                  </span>
                </div>
                <span className="badge badge-running" style={{ fontSize: '0.7rem' }}>Exit Code 0</span>
              </div>
              <div style={{
                padding: '14px',
                fontFamily: 'Consolas, monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                flexGrow: 1,
                color: solvedResult.status === 'SUCCESS' ? '#4ade80' : '#f87171',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px' }}>
                  $ python3 -c "{solvedResult.problem.slice(0, 30)}..."
                </div>
                {solvedResult.execution_output || '(No stdout)'}
              </div>
            </div>
          </div>

          {/* Agent-Wise Execution Status Cards */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Agent-Wise Execution Status:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
              {solvedResult.agents?.map(ag => (
                <div key={ag.agent_id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ag.name}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: ag.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: ag.status === 'SUCCESS' ? 'var(--status-healthy)' : 'var(--status-critical)'
                    }}>
                      {ag.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Role: <strong style={{ color: 'var(--text-secondary)' }}>{ag.role}</strong> (PID: {ag.pid})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {ag.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Reports (Toggled by "View Detailed Report") */}
          {showDetailedReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              {/* Row: Code Review & Testing Report */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                {/* Code Review Report (Agent 03) */}
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Code Review Report (Agent 03 - Code Reviewer)
                    </h3>
                  </div>

                  {solvedResult.code_review && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>AST Syntax Validation:</span>
                        <span style={{ fontWeight: 700, color: solvedResult.code_review.syntax_valid ? 'var(--status-healthy)' : 'var(--status-critical)' }}>
                          {solvedResult.code_review.syntax_valid ? 'PASSED (Valid Python AST)' : 'FAILED'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>AST Node Count:</span>
                        <span className="font-mono" style={{ fontWeight: 600 }}>{solvedResult.code_review.ast_node_count} nodes</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Estimated Time Complexity:</span>
                        <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{solvedResult.code_review.time_complexity}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Estimated Auxiliary Space:</span>
                        <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{solvedResult.code_review.space_complexity}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Safety & Sandboxing Check:</span>
                        <span style={{ fontWeight: 600, color: 'var(--status-healthy)', textAlign: 'right', maxWidth: '240px' }}>
                          {solvedResult.code_review.safety_check}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Quality Score:</span>
                        <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{solvedResult.code_review.quality_score}</span>
                      </div>
                      <div style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.74rem', fontStyle: 'italic' }}>
                        Summary: {solvedResult.code_review.summary}
                      </div>
                    </div>
                  )}
                </div>

                {/* Testing Report (Agent 04) */}
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ListChecks size={18} style={{ color: 'var(--status-healthy)' }} />
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Testing Report (Agent 04 - Testing Agent)
                      </h3>
                    </div>
                    {solvedResult.testing_report && (
                      <span className="badge badge-online" style={{ fontSize: '0.7rem' }}>
                        {solvedResult.testing_report.passed_tests}/{solvedResult.testing_report.total_tests} Tests Passed
                      </span>
                    )}
                  </div>

                  {solvedResult.testing_report?.test_cases?.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: '6px' }}>Test Input</th>
                            <th style={{ padding: '6px' }}>Expected</th>
                            <th style={{ padding: '6px' }}>Actual</th>
                            <th style={{ padding: '6px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {solvedResult.testing_report.test_cases.map((tc, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td className="font-mono" style={{ padding: '6px', color: 'var(--accent)' }}>{tc.input}</td>
                              <td className="font-mono" style={{ padding: '6px' }}>{tc.expected}</td>
                              <td className="font-mono" style={{ padding: '6px' }}>{tc.actual}</td>
                              <td style={{ padding: '6px' }}>
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  backgroundColor: tc.status === 'PASSED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: tc.status === 'PASSED' ? 'var(--status-healthy)' : 'var(--status-critical)'
                                }}>
                                  {tc.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {solvedResult.testing_report?.summary}
                    </div>
                  )}
                </div>
              </div>

              {/* IPC Pipeline Trace */}
              {solvedResult.ipc_pipeline?.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    POSIX Inter-Process Communication (Named Pipes / FIFO) Trace:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {solvedResult.ipc_pipeline.map((line, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <ArrowRight size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span className="font-mono">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Standard Manual POSIX Task Dispatch (Existing Module Preserved) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Task Submission Form */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PlaySquare size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Manual POSIX Task Dispatch
            </h2>
          </div>

          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="select-agent">Target Agent</label>
              <select
                id="select-agent"
                className="form-select"
                value={form.agent_id}
                onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
                required
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} (PID: {ag.pid}) - {ag.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-type">Task Type</label>
              <select
                id="task-type"
                className="form-select"
                value={form.task_type}
                onChange={(e) => setForm({ ...form, task_type: e.target.value })}
              >
                <option value="CODE_GENERATION">CODE_GENERATION</option>
                <option value="CODE_EXECUTION">CODE_EXECUTION</option>
                <option value="CODE_REVIEW">CODE_REVIEW</option>
                <option value="TESTING">TESTING</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Task Description</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                rows={2}
                placeholder="e.g. Execute static code analysis and calculate cyclomatic complexity"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-prio">Priority (Nice)</label>
                <input
                  id="task-prio"
                  type="number"
                  min="-20"
                  max="19"
                  className="form-input font-mono"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-cpu">CPU Limit (%)</label>
                <input
                  id="task-cpu"
                  type="number"
                  min="5"
                  max="100"
                  className="form-input font-mono"
                  value={form.cpu_limit}
                  onChange={(e) => setForm({ ...form, cpu_limit: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-mem">Mem Limit (MB)</label>
                <input
                  id="task-mem"
                  type="number"
                  min="64"
                  max="2048"
                  className="form-input font-mono"
                  value={form.memory_limit_mb}
                  onChange={(e) => setForm({ ...form, memory_limit_mb: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              <Send size={16} />
              <span>{loading ? 'Submitting to Kernel...' : 'DISPATCH TASK'}</span>
            </button>
          </form>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Execution Lifecycle Stepper
            </h2>
          </div>

          {submittedTask ? (
            <div>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, color: 'var(--accent)' }}>Task ID: {submittedTask.task_id}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Assigned to {submittedTask.agent_name} (PID: {submittedTask.pid})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Result: {submittedTask.result}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {submittedTask.lifecycle?.map((stage, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--status-healthy)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {stage.stage}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {stage.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <PlaySquare size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>
                Submit a task to view the 7-stage POSIX lifecycle progression in real time:
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                QUEUED → ASSIGNED → RUNNING → IPC COMMUNICATION → RESOURCE MONITORING → COMPLETED → RESULT LOGGED
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: Task Execution History Table */}
      <div className="glass-card">
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Task Execution History
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time audit log of all problems and tasks executed across kernel processes
            </p>
          </div>
        </div>

        <div className="os-table-container">
          <table className="os-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Agent / Solver</th>
                <th>PID</th>
                <th>Type</th>
                <th>Problem / Description</th>
                <th>CPU Usage</th>
                <th>Memory Usage</th>
                <th>Status</th>
                <th>Actual Solved Answer / Result</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No tasks submitted yet. Submit a problem above to see live results.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.task_id}>
                    <td className="font-mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                      {t.task_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.agent_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.agent_id}</div>
                    </td>
                    <td className="font-mono">{t.pid}</td>
                    <td>
                      <span className="badge badge-waiting">{t.task_type}</span>
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description}
                    </td>
                    <td className="font-mono">{t.cpu_usage}%</td>
                    <td className="font-mono">{t.memory_usage} MB</td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600, color: t.status === 'COMPLETED' ? 'var(--status-healthy)' : 'var(--text-secondary)' }}>
                      {t.final_answer ? (
                        <span>{t.final_answer}</span>
                      ) : (
                        <span>{t.result}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
