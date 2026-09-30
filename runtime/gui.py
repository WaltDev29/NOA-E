import sys
import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QGridLayout,
    QLabel, QPushButton, QLineEdit, QScrollArea, QFrame,
    QDialog, QFileDialog, QMessageBox, QCheckBox, QGroupBox, QSizePolicy,
    QTabWidget, QListWidget, QListWidgetItem, QAbstractItemView,
    QRadioButton, QButtonGroup
)
from PySide6.QtCore import Qt, QThread, Signal, Slot, QTimer, QSize
from PySide6.QtGui import QFont, QCursor

# Path setup
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
for p in [current_dir, parent_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from runtime.core.engine.compiler import WorkflowCompiler
    from runtime.storage import (
        load_sessions, save_sessions, create_new_session, delete_session,
        update_session_messages, extract_llm_nodes, update_llm_configs_in_workflow,
        load_agents_registry, register_agent, get_last_agent_path, set_last_agent_path,
        get_app_theme, set_app_theme
    )
    from runtime.config import DEFAULT_SERVER_OLLAMA_URL, DEFAULT_MODEL
except ModuleNotFoundError:
    from core.engine.compiler import WorkflowCompiler
    from storage import (
        load_sessions, save_sessions, create_new_session, delete_session,
        update_session_messages, extract_llm_nodes, update_llm_configs_in_workflow,
        load_agents_registry, register_agent, get_last_agent_path, set_last_agent_path,
        get_app_theme, set_app_theme
    )
    from config import DEFAULT_SERVER_OLLAMA_URL, DEFAULT_MODEL


DARK_STYLESHEET = """
QMainWindow, QWidget {
    background-color: #11151c;
    color: #e6edf3;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Malgun Gothic", sans-serif;
    font-size: 13px;
}

QLabel {
    background-color: transparent;
    border: none;
    color: #e6edf3;
}

/* Sidebar */
#SidebarFrame {
    background-color: #161b24;
    border-right: 1px solid #222938;
}

#AppBrandLabel {
    font-size: 17px;
    font-weight: 800;
    color: #4d8eff;
    letter-spacing: 0.5px;
    background-color: transparent;
    border: none;
}

#AgentTitle {
    font-size: 14px;
    font-weight: bold;
    color: #ffffff;
    background-color: transparent;
    border: none;
}

#AgentDesc {
    font-size: 11px;
    color: #8c9ba5;
    line-height: 1.35;
    background-color: transparent;
    border: none;
}

/* Buttons */
QPushButton {
    background-color: #1f2736;
    border: 1px solid #2c384d;
    color: #e6edf3;
    padding: 8px 14px;
    border-radius: 6px;
    font-weight: 500;
}
QPushButton:hover {
    background-color: #273245;
    border-color: #4d8eff;
}
QPushButton:pressed {
    background-color: #19202c;
}

#PrimaryButton {
    background-color: #3875e8;
    border: 1px solid #4882ee;
    color: #ffffff;
    font-weight: bold;
}
#PrimaryButton:hover {
    background-color: #4a84f3;
    border-color: #6da0ff;
}

#StopButton {
    background-color: #ba1a1a;
    border: 1px solid #ff5449;
    color: #ffffff;
    font-weight: bold;
}
#StopButton:hover {
    background-color: #cf2222;
    border-color: #ff736a;
}

#SettingsButton {
    background-color: #1a2230;
    border: 1px solid #2c384d;
    color: #b9c8de;
    font-weight: 600;
    padding: 10px;
    border-radius: 6px;
}
#SettingsButton:hover {
    background-color: #242f42;
    border-color: #4d8eff;
    color: #ffffff;
}

/* Session Item */
#SessionItemWidget {
    background-color: #1a212d;
    border: 1px solid #232c3d;
    border-radius: 6px;
}
#SessionItemWidget[selected="true"] {
    background-color: #222d3d;
    border: 1px solid #4d8eff;
}

#SessionDeleteBtn {
    background-color: #2c384d;
    border: 1px solid #3d4d68;
    color: #ff8c82;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
}
#SessionDeleteBtn:hover {
    background-color: #ba1a1a;
    border-color: #ff5449;
    color: #ffffff;
}

/* Chat Header */
#ChatHeader {
    background-color: #141923;
    border-bottom: 1px solid #222938;
}

#ChatHeaderLabel {
    font-size: 15px;
    font-weight: bold;
    color: #ffffff;
    background: transparent;
    border: none;
}

/* Message Bubbles */
#UserBubbleFrame {
    background-color: #1e2e45;
    border: 1px solid #2d4263;
    border-radius: 10px;
}
#UserBubbleFrame QLabel {
    color: #f0f6fc;
}

#AgentBubbleFrame {
    background-color: #161e2b;
    border: 1px solid #243044;
    border-radius: 10px;
}
#AgentBubbleFrame QLabel {
    color: #e6edf3;
}

/* Scroll Area */
QScrollArea {
    background-color: transparent;
    border: none;
}

/* Input Box */
QLineEdit, QTextEdit {
    background-color: #161c27;
    border: 1px solid #283345;
    border-radius: 6px;
    padding: 10px 14px;
    color: #ffffff;
    selection-background-color: #4d8eff;
}
QLineEdit:focus, QTextEdit:focus {
    border: 1px solid #4d8eff;
}

#InputContainerFrame {
    background-color: #141923;
    border-top: 1px solid #222938;
    padding: 14px 22px;
}

/* Dialog */
QDialog {
    background-color: #141923;
    color: #e6edf3;
}

/* Radio Buttons */
QRadioButton {
    color: #e6edf3;
    font-size: 13px;
    spacing: 8px;
    background: transparent;
}
QRadioButton::indicator {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    border: 1px solid #3d4d68;
    background-color: #161c27;
}
QRadioButton::indicator:checked {
    background-color: #4d8eff;
    border: 3px solid #141923;
}

/* Tab Widget */
QTabWidget::pane {
    border: 1px solid #283548;
    background-color: #141923;
    border-radius: 8px;
    top: -1px;
}

QTabBar::tab {
    background-color: #1a2230;
    border: 1px solid #283548;
    color: #94a3b8;
    padding: 9px 20px;
    margin-right: 4px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    font-weight: 600;
}

QTabBar::tab:selected {
    background-color: #141923;
    border-bottom-color: #141923;
    color: #4d8eff;
}

QTabBar::tab:hover:!selected {
    background-color: #232d3f;
    color: #e6edf3;
}

/* Agent List in Settings */
QListWidget#AgentListWidget {
    background-color: #0f131a;
    border: 1px solid #263345;
    border-radius: 6px;
    padding: 6px;
}

QListWidget#AgentListWidget::item {
    background-color: #161c26;
    border: 1px solid #222c3c;
    border-radius: 6px;
    margin: 4px 2px;
}

/* Thought Log & Pure Dots (Dark) */
#ThoughtLogToggleBtn {
    background-color: #171f2b;
    border: 1px solid #263245;
    border-radius: 6px;
    color: #8bb8ff;
    font-size: 11px;
    font-weight: bold;
    text-align: left;
    padding: 7px 10px;
}
#ThoughtLogToggleBtn:hover {
    background-color: #1f2a3a;
    border-color: #4d8eff;
}
#ThoughtLogLiveArea, #ThoughtLogBox {
    background-color: #0d121a;
    border: 1px solid #243245;
    border-radius: 6px;
}
#ThoughtLogItemFrame {
    background-color: #141b26;
    border: 1px solid #263345;
    border-radius: 5px;
}
#ThoughtLogItemLabel {
    color: #b0c4de;
    font-family: monospace;
    font-size: 11px;
    line-height: 1.4;
    background: transparent;
    border: none;
}
#ThoughtPendingDots {
    color: #4d8eff;
    font-size: 11px;
    font-style: italic;
    background: transparent;
    border: none;
    padding: 4px;
}
#PureDotsFrame {
    background-color: #161e2b;
    border: 1px solid #243044;
    border-radius: 10px;
}
#PureDotsLabel {
    color: #4d8eff;
    font-size: 16px;
    font-weight: bold;
    background: transparent;
    border: none;
}
"""

LIGHT_STYLESHEET = """
QMainWindow, QWidget {
    background-color: #f8fafc;
    color: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Malgun Gothic", sans-serif;
    font-size: 13px;
}

QLabel {
    background-color: transparent;
    border: none;
    color: #0f172a;
}

/* Sidebar */
#SidebarFrame {
    background-color: #ffffff;
    border-right: 1px solid #e2e8f0;
}

#AppBrandLabel {
    font-size: 17px;
    font-weight: 800;
    color: #2563eb;
    letter-spacing: 0.5px;
    background-color: transparent;
    border: none;
}

#AgentTitle {
    font-size: 14px;
    font-weight: bold;
    color: #0f172a;
    background-color: transparent;
    border: none;
}

#AgentDesc {
    font-size: 11px;
    color: #64748b;
    line-height: 1.35;
    background-color: transparent;
    border: none;
}

/* Buttons */
QPushButton {
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #1e293b;
    padding: 8px 14px;
    border-radius: 6px;
    font-weight: 500;
}
QPushButton:hover {
    background-color: #e2e8f0;
    border-color: #2563eb;
}
QPushButton:pressed {
    background-color: #cbd5e1;
}

#PrimaryButton {
    background-color: #2563eb;
    border: 1px solid #1d4ed8;
    color: #ffffff;
    font-weight: bold;
}
#PrimaryButton:hover {
    background-color: #1d4ed8;
    border-color: #1e40af;
}

#StopButton {
    background-color: #dc2626;
    border: 1px solid #b91c1c;
    color: #ffffff;
    font-weight: bold;
}
#StopButton:hover {
    background-color: #b91c1c;
    border-color: #991b1b;
}

#SettingsButton {
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #334155;
    font-weight: 600;
    padding: 10px;
    border-radius: 6px;
}
#SettingsButton:hover {
    background-color: #e2e8f0;
    border-color: #2563eb;
    color: #0f172a;
}

/* Session Item */
#SessionItemWidget {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
}
#SessionItemWidget[selected="true"] {
    background-color: #eff6ff;
    border: 1px solid #3b82f6;
}

#SessionDeleteBtn {
    background-color: #fee2e2;
    border: 1px solid #fecaca;
    color: #dc2626;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
}
#SessionDeleteBtn:hover {
    background-color: #dc2626;
    border-color: #b91c1c;
    color: #ffffff;
}

/* Chat Header */
#ChatHeader {
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
}

#ChatHeaderLabel {
    font-size: 15px;
    font-weight: bold;
    color: #0f172a;
    background: transparent;
    border: none;
}

/* Message Bubbles */
#UserBubbleFrame {
    background-color: #e0edff;
    border: 1px solid #bfdbfe;
    border-radius: 10px;
}
#UserBubbleFrame QLabel {
    color: #0f172a;
}

#AgentBubbleFrame {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
}
#AgentBubbleFrame QLabel {
    color: #1e293b;
}

/* Scroll Area */
QScrollArea {
    background-color: transparent;
    border: none;
}

/* Input Box */
QLineEdit, QTextEdit {
    background-color: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 14px;
    color: #0f172a;
    selection-background-color: #bfdbfe;
    selection-color: #0f172a;
}
QLineEdit:focus, QTextEdit:focus {
    border: 1px solid #2563eb;
}

#InputContainerFrame {
    background-color: #ffffff;
    border-top: 1px solid #e2e8f0;
    padding: 14px 22px;
}

/* Dialog */
QDialog {
    background-color: #ffffff;
    color: #0f172a;
}

/* Radio Buttons */
QRadioButton {
    color: #0f172a;
    font-size: 13px;
    spacing: 8px;
    background: transparent;
}
QRadioButton::indicator {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    border: 1px solid #94a3b8;
    background-color: #ffffff;
}
QRadioButton::indicator:checked {
    background-color: #2563eb;
    border: 3px solid #ffffff;
}

/* Tab Widget */
QTabWidget::pane {
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    border-radius: 8px;
    top: -1px;
}

QTabBar::tab {
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #64748b;
    padding: 9px 20px;
    margin-right: 4px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    font-weight: 600;
}

QTabBar::tab:selected {
    background-color: #ffffff;
    border-bottom-color: #ffffff;
    color: #2563eb;
}

QTabBar::tab:hover:!selected {
    background-color: #e2e8f0;
    color: #0f172a;
}

/* Agent List in Settings */
QListWidget#AgentListWidget {
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px;
}

QListWidget#AgentListWidget::item {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    margin: 4px 2px;
}

QListWidget#AgentListWidget::item:selected {
    background-color: #eff6ff;
    border: 1px solid #3b82f6;
}

QListWidget#AgentListWidget::item:hover {
    background-color: #f1f5f9;
    border-color: #60a5fa;
}

/* Thought Log & Pure Dots (Light) */
#ThoughtLogToggleBtn {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    color: #1d4ed8;
    font-size: 11px;
    font-weight: bold;
    text-align: left;
    padding: 7px 10px;
}
#ThoughtLogToggleBtn:hover {
    background-color: #dbeafe;
    border-color: #2563eb;
}
#ThoughtLogLiveArea, #ThoughtLogBox {
    background-color: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
}
#ThoughtLogItemFrame {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
}
#ThoughtLogItemLabel {
    color: #334155;
    font-family: monospace;
    font-size: 11px;
    line-height: 1.4;
    background: transparent;
    border: none;
}
#ThoughtPendingDots {
    color: #2563eb;
    font-size: 11px;
    font-style: italic;
    background: transparent;
    border: none;
    padding: 4px;
}
#PureDotsFrame {
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
}
#PureDotsLabel {
    color: #2563eb;
    font-size: 16px;
    font-weight: bold;
    background: transparent;
    border: none;
}
"""


# -------------------------------------------------------------
# 실시간 스트리밍 지원 비동기 실행 워커 (QThread)
# -------------------------------------------------------------
class AgentExecutionWorker(QThread):
    step_log_signal = Signal(str, str, str)    # session_id, node_name, log_message
    finished_signal = Signal(str, str, list)   # session_id, output, logs
    error_signal = Signal(str, str)            # session_id, error_message

    def __init__(self, session_id: str, compiled_graph, user_input: str, conversation_messages: list):
        super().__init__()
        self.session_id = session_id
        self.compiled_graph = compiled_graph
        self.user_input = user_input
        self.conversation_messages = conversation_messages
        self._is_stopped = False

    def stop(self):
        self._is_stopped = True

    def run(self):
        try:
            initial_state = {
                "input_text": self.user_input,
                "current_output": "",
                "messages": self.conversation_messages,
                "logs": []
            }

            accumulated_logs = []
            final_output = ""

            # stream_mode="updates"를 사용하여 노드 실행 완료 시마다 실시간 로그 전달
            for chunk in self.compiled_graph.stream(initial_state, stream_mode="updates"):
                if self._is_stopped:
                    stop_msg = "[시스템] 사용자에 의해 생성이 중단되었습니다."
                    accumulated_logs.append(stop_msg)
                    self.step_log_signal.emit(self.session_id, "system", stop_msg)
                    final_output = "사용자에 의해 응답 생성이 중단되었습니다."
                    break

                for node_name, state_update in chunk.items():
                    if "logs" in state_update and state_update["logs"]:
                        for log_line in state_update["logs"]:
                            accumulated_logs.append(log_line)
                            self.step_log_signal.emit(self.session_id, node_name, log_line)

                    if "current_output" in state_update and state_update["current_output"]:
                        final_output = state_update["current_output"]

            if not final_output and not self._is_stopped:
                final_output = "응답이 생성되지 않았습니다."

            self.finished_signal.emit(self.session_id, final_output, accumulated_logs)

        except Exception as e:
            if not self._is_stopped:
                self.error_signal.emit(self.session_id, str(e))


# -------------------------------------------------------------
# 사고 과정 (Thought Log) 실시간/접이식 아코디언 위젯
# -------------------------------------------------------------
class ThoughtLogToggleWidget(QWidget):
    def __init__(self, logs: list = None, is_live: bool = False, parent=None):
        super().__init__(parent)
        self.logs = list(logs or [])
        self.is_expanded = is_live        # 실행 중에는 펼침, 완료 후에는 접힘
        self.is_finalized = not is_live   # is_live이면 아직 output 전(False), 아니면 완료 상태(True)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignTop)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)

        self.btn_toggle = QPushButton("사고 과정 보기" if not self.is_expanded else "사고 과정 접기")
        self.btn_toggle.setObjectName("ThoughtLogToggleBtn")
        self.btn_toggle.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self.btn_toggle.setCursor(QCursor(Qt.PointingHandCursor))
        self.btn_toggle.clicked.connect(self.toggle)
        layout.addWidget(self.btn_toggle)

        # -------------------------------------------------------------
        # 1. 실행 중(Live) 전용 스크롤 컨테이너 (200px 고정 + 자동 스크롤)
        # -------------------------------------------------------------
        self.live_scroll_area = QScrollArea()
        self.live_scroll_area.setObjectName("ThoughtLogLiveArea")
        self.live_scroll_area.setWidgetResizable(True)
        self.live_scroll_area.setFrameShape(QFrame.NoFrame)
        self.live_scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.live_scroll_area.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self.live_scroll_area.setFixedHeight(200)

        self.live_content_widget = QWidget()
        self.live_content_widget.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Preferred)
        self.live_content_widget.setStyleSheet("background: transparent; border: none;")
        self.live_layout = QVBoxLayout(self.live_content_widget)
        self.live_layout.setAlignment(Qt.AlignTop)
        self.live_layout.setContentsMargins(6, 6, 6, 6)
        self.live_layout.setSpacing(6)

        self.live_scroll_area.setWidget(self.live_content_widget)

        # -------------------------------------------------------------
        # 2. 완료 후(Finalized) 전용 전체 확장 컨테이너 (고정 높이 없이 내부 요소 전체 노출)
        # -------------------------------------------------------------
        self.static_content_box = QFrame()
        self.static_content_box.setObjectName("ThoughtLogBox")
        self.static_content_box.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        self.static_layout = QVBoxLayout(self.static_content_box)
        self.static_layout.setAlignment(Qt.AlignTop)
        self.static_layout.setContentsMargins(6, 6, 6, 6)
        self.static_layout.setSpacing(6)

        # 초기 로그 아이템 배치
        for log in self.logs:
            self._add_log_item_ui(log)

        # 다음 노드 실행 대기 애니메이션 라벨 (실행 중 스크롤 영역에만 표시)
        self.lbl_pending_dots = QLabel("다음 노드 실행 대기 중 .")
        self.lbl_pending_dots.setObjectName("ThoughtPendingDots")
        self.lbl_pending_dots.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        self.lbl_pending_dots.setVisible(not self.is_finalized)
        self.live_layout.addWidget(self.lbl_pending_dots)

        self.dot_count = 1
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_dots)
        if not self.is_finalized and self.is_expanded:
            self.timer.start(350)

        layout.addWidget(self.live_scroll_area)
        layout.addWidget(self.static_content_box)

        self._adjust_live_scroll_height()
        self._update_visibility()

    def _adjust_live_scroll_height(self):
        """200px 이전까지는 내부 요소 크기만큼 높이를 가지고, 200px 도달 시 최대 높이 고정 및 스크롤 작동"""
        if not self.is_finalized:
            QApplication.processEvents()
            hint_h = self.live_layout.sizeHint().height() + 6
            target_h = min(200, max(36, hint_h))
            self.live_scroll_area.setFixedHeight(target_h)

    def _create_log_item_frame(self, log_text: str) -> QFrame:
        item_frame = QFrame()
        item_frame.setObjectName("ThoughtLogItemFrame")
        item_frame.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        f_layout = QVBoxLayout(item_frame)
        f_layout.setContentsMargins(10, 6, 10, 6)
        f_layout.setSpacing(0)

        lbl = QLabel(f"• {log_text}")
        lbl.setObjectName("ThoughtLogItemLabel")
        lbl.setWordWrap(True)
        lbl.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        lbl.setTextInteractionFlags(Qt.TextSelectableByMouse)
        f_layout.addWidget(lbl)
        return item_frame

    def _add_log_item_ui(self, log_text: str):
        # 1. 라이브 스크롤 컨테이너에 추가 (점 애니메이션 위쪽)
        idx_live = max(0, self.live_layout.count() - 1)
        self.live_layout.insertWidget(idx_live, self._create_log_item_frame(log_text))

        # 2. 완료 후 전체 표시 컨테이너에도 추가
        self.static_layout.addWidget(self._create_log_item_frame(log_text))

    def update_dots(self):
        self.dot_count = (self.dot_count % 3) + 1
        dots_str = "." * self.dot_count
        self.lbl_pending_dots.setText(f"다음 노드 실행 대기 중 {dots_str}")

    def append_log(self, log_text: str):
        self.logs.append(log_text)
        self._add_log_item_ui(log_text)
        self._adjust_live_scroll_height()
        QApplication.processEvents()
        self.live_scroll_area.verticalScrollBar().setValue(
            self.live_scroll_area.verticalScrollBar().maximum()
        )

    def finalize(self):
        self.timer.stop()
        self.is_finalized = True
        self.lbl_pending_dots.setVisible(False)
        self.is_expanded = False
        self.btn_toggle.setText("사고 과정 보기")
        self._update_visibility()

    def _update_visibility(self):
        if not self.is_expanded:
            self.live_scroll_area.setVisible(False)
            self.static_content_box.setVisible(False)
        else:
            if not self.is_finalized:
                # 실행 중: 내부 요소 높이에 맞춘 동적 높이(최대 200px) 스크롤 영역 활성화
                self._adjust_live_scroll_height()
                self.live_scroll_area.setVisible(True)
                self.static_content_box.setVisible(False)
            else:
                # 완료 후: 고정 높이 없이 모든 요소가 한 번에 다 보이는 정적 컨테이너 활성화
                self.live_scroll_area.setVisible(False)
                self.static_content_box.setVisible(True)

    def toggle(self):
        self.is_expanded = not self.is_expanded
        self._update_visibility()
        if self.is_expanded:
            self.btn_toggle.setText("사고 과정 접기")
            if not self.is_finalized:
                if not self.timer.isActive():
                    self.timer.start(350)
                self._adjust_live_scroll_height()
                QApplication.processEvents()
                self.live_scroll_area.verticalScrollBar().setValue(
                    self.live_scroll_area.verticalScrollBar().maximum()
                )
        else:
            self.btn_toggle.setText("사고 과정 보기")
            if self.timer.isActive():
                self.timer.stop()


# -------------------------------------------------------------
# 순수 점(...) 깜빡임 애니메이션 위젯 (텍스트 없이 순수 도트만)
# -------------------------------------------------------------
class PureDotsAnimationWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        row_layout = QHBoxLayout(self)
        row_layout.setContentsMargins(0, 0, 0, 0)
        row_layout.setSpacing(0)
        row_layout.setAlignment(Qt.AlignTop)

        self.bubble_frame = QFrame()
        self.bubble_frame.setObjectName("PureDotsFrame")
        self.bubble_frame.setSizePolicy(QSizePolicy.Maximum, QSizePolicy.Maximum)
        f_layout = QHBoxLayout(self.bubble_frame)
        f_layout.setContentsMargins(8, 4, 8, 4)

        self.lbl_dots = QLabel(". . .")
        self.lbl_dots.setObjectName("PureDotsLabel")
        f_layout.addWidget(self.lbl_dots)

        row_layout.addWidget(self.bubble_frame)
        row_layout.addStretch(1)

        self.dot_count = 1
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_dots)
        self.timer.start(350)

    def update_dots(self):
        self.dot_count = (self.dot_count % 3) + 1
        dots_str = " ".join(["." for _ in range(self.dot_count)])
        self.lbl_dots.setText(dots_str)

    def stop(self):
        self.timer.stop()


# -------------------------------------------------------------
# 마우스 호버 시에만 '삭제' 버튼 노출되는 세션 리스트 아이템
# -------------------------------------------------------------
class SessionListItemWidget(QWidget):
    deleted_signal = Signal(str)
    selected_signal = Signal(str)

    def __init__(self, session_id: str, title: str, is_selected: bool = False, parent=None):
        super().__init__(parent)
        self.session_id = session_id
        self.title = title
        self.is_selected = is_selected

        layout = QHBoxLayout(self)
        layout.setContentsMargins(4, 3, 4, 3)
        layout.setSpacing(0)

        self.frame = QFrame()
        self.frame.setObjectName("SessionItemWidget")
        self.frame.setProperty("selected", "true" if is_selected else "false")
        self.frame.setCursor(QCursor(Qt.PointingHandCursor))
        
        f_layout = QHBoxLayout(self.frame)
        f_layout.setContentsMargins(10, 8, 8, 8)
        f_layout.setSpacing(6)

        self.lbl_title = QLabel(self.title)
        self.lbl_title.setStyleSheet("font-size: 12px; font-weight: 500; background: transparent; border: none;")
        f_layout.addWidget(self.lbl_title, 1)

        self.btn_del = QPushButton("삭제")
        self.btn_del.setObjectName("SessionDeleteBtn")
        self.btn_del.setToolTip("대화 삭제")
        self.btn_del.setCursor(QCursor(Qt.PointingHandCursor))
        self.btn_del.setVisible(False)
        self.btn_del.clicked.connect(self.on_delete_clicked)
        f_layout.addWidget(self.btn_del)

        layout.addWidget(self.frame)

    def enterEvent(self, event):
        self.btn_del.setVisible(True)
        super().enterEvent(event)

    def leaveEvent(self, event):
        self.btn_del.setVisible(False)
        super().leaveEvent(event)

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.selected_signal.emit(self.session_id)
        super().mousePressEvent(event)

    def on_delete_clicked(self):
        reply = QMessageBox.question(
            self,
            "대화 삭제 확인",
            f"'{self.title}' 대화를 정말 삭제하시겠습니까?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            self.deleted_signal.emit(self.session_id)


# -------------------------------------------------------------
# 단일 화면으로 통합된 에이전트 설정 다이얼로그 (모델명 수정 완벽 지원)
# -------------------------------------------------------------
# -------------------------------------------------------------
# 탭 기반 에이전트 설정 다이얼로그 (에이전트 목록 탭 기본 제공)
# -------------------------------------------------------------
class SettingsDialog(QDialog):
    def __init__(self, parent=None, workflow_dict=None, workflow_path=None):
        super().__init__(parent)
        self.setWindowTitle("에이전트 설정 및 관리")
        self.resize(720, 600)
        self.workflow_dict = workflow_dict
        self.workflow_path = workflow_path
        self.node_input_widgets = {}
        self.registered_agents = load_agents_registry()
        self.selected_agent_path = workflow_path

        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(14)

        # 탭 위젯 생성
        self.tabs = QTabWidget()

        # -----------------------------
        # Tab 1: 에이전트 목록 (기본 탭)
        # -----------------------------
        tab_agents = QWidget()
        t_agents_layout = QVBoxLayout(tab_agents)
        t_agents_layout.setContentsMargins(14, 16, 14, 14)
        t_agents_layout.setSpacing(12)

        # 상단: 새 에이전트 불러오기 영역
        grp_browse = QGroupBox("새 에이전트 파일 불러오기")
        grp_browse.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 1px solid #283548;
                border-radius: 6px;
                padding-top: 14px;
                color: #4d8eff;
                background-color: transparent;
            }
        """)
        g_browse_layout = QHBoxLayout(grp_browse)
        g_browse_layout.setContentsMargins(12, 12, 12, 12)
        g_browse_layout.setSpacing(8)

        self.txt_selected_file = QLineEdit()
        self.txt_selected_file.setReadOnly(True)
        self.txt_selected_file.setPlaceholderText("선택된 워크플로우 JSON 파일 없음")
        if self.workflow_path:
            self.txt_selected_file.setText(self.workflow_path)
        g_browse_layout.addWidget(self.txt_selected_file)

        btn_browse = QPushButton("파일 찾아보기")
        btn_browse.setObjectName("PrimaryButton")
        btn_browse.clicked.connect(self.on_browse_and_load_file)
        g_browse_layout.addWidget(btn_browse)
        t_agents_layout.addWidget(grp_browse)

        # 중단: 등록된 에이전트 목록
        lbl_list_title = QLabel("등록된 에이전트 목록 (선택 후 [저장] 클릭 시 해당 에이전트로 즉시 전환됩니다)")
        lbl_list_title.setStyleSheet("font-size: 12px; font-weight: 600; color: #94a3b8;")
        t_agents_layout.addWidget(lbl_list_title)

        self.agent_list_widget = QListWidget()
        self.agent_list_widget.setObjectName("AgentListWidget")
        self.agent_list_widget.setSelectionMode(QAbstractItemView.SingleSelection)
        self.agent_list_widget.itemClicked.connect(self.on_agent_item_clicked)
        t_agents_layout.addWidget(self.agent_list_widget)

        self.refresh_agents_list_ui()

        # -----------------------------
        # Tab 2: LLM 노드 설정
        # -----------------------------
        tab_llm = QWidget()
        t_llm_layout = QVBoxLayout(tab_llm)
        t_llm_layout.setContentsMargins(14, 16, 14, 14)
        t_llm_layout.setSpacing(12)

        self.lbl_llm_info = QLabel("현재 선택된 워크플로우의 LLM / Agent 노드 설정을 구성합니다.")
        self.lbl_llm_info.setStyleSheet("color: #4cd7f6; font-size: 12px; font-weight: bold;")
        t_llm_layout.addWidget(self.lbl_llm_info)

        self.scroll_llm = QScrollArea()
        self.scroll_llm.setWidgetResizable(True)
        self.scroll_llm.setFrameShape(QFrame.NoFrame)
        self.scroll_content = QWidget()
        self.scroll_layout = QVBoxLayout(self.scroll_content)
        self.scroll_layout.setContentsMargins(0, 0, 0, 0)
        self.scroll_layout.setSpacing(12)
        self.scroll_llm.setWidget(self.scroll_content)
        t_llm_layout.addWidget(self.scroll_llm)

        # -----------------------------
        # Tab 3: 화면 테마 및 환경 설정
        # -----------------------------
        tab_theme = QWidget()
        t_theme_layout = QVBoxLayout(tab_theme)
        t_theme_layout.setContentsMargins(16, 18, 16, 16)
        t_theme_layout.setSpacing(14)

        lbl_theme_title = QLabel("화면 테마 설정 (Theme Preference)")
        lbl_theme_title.setStyleSheet("font-size: 13px; font-weight: bold; color: #4d8eff;")
        t_theme_layout.addWidget(lbl_theme_title)

        grp_theme = QGroupBox("애플리케이션 인터페이스 모드")
        grp_theme.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 1px solid #283548;
                border-radius: 6px;
                padding-top: 14px;
                background-color: transparent;
            }
        """)
        g_theme_layout = QVBoxLayout(grp_theme)
        g_theme_layout.setContentsMargins(14, 16, 14, 16)
        g_theme_layout.setSpacing(12)

        self.current_app_theme = get_app_theme()

        self.radio_dark = QRadioButton("🌙 다크 테마 (Dark Mode) - 눈의 피로를 덜어주는 차분한 다크 UI")
        self.radio_light = QRadioButton("☀️ 화이트 테마 (Light Mode) - 밝고 선명한 화이트/라이트 UI")

        if self.current_app_theme == "light":
            self.radio_light.setChecked(True)
        else:
            self.radio_dark.setChecked(True)

        g_theme_layout.addWidget(self.radio_dark)
        g_theme_layout.addWidget(self.radio_light)
        t_theme_layout.addWidget(grp_theme)
        t_theme_layout.addStretch()

        # 탭 추가 (에이전트 목록이 첫 번째 탭)
        self.tabs.addTab(tab_agents, "에이전트 목록")
        self.tabs.addTab(tab_llm, "LLM 노드 설정")
        self.tabs.addTab(tab_theme, "화면 테마 설정")
        self.tabs.setCurrentIndex(0) # 기본 탭으로 에이전트 목록 표시

        main_layout.addWidget(self.tabs)

        # -----------------------------
        # 하단: [저장] & [닫기]
        # -----------------------------
        h_bottom = QHBoxLayout()
        h_bottom.addStretch()

        btn_save = QPushButton("저장")
        btn_save.setObjectName("PrimaryButton")
        btn_save.setFixedWidth(90)
        btn_save.clicked.connect(self.on_save_settings)
        h_bottom.addWidget(btn_save)

        btn_close = QPushButton("닫기")
        btn_close.setFixedWidth(80)
        btn_close.clicked.connect(self.reject)
        h_bottom.addWidget(btn_close)

        main_layout.addLayout(h_bottom)

        self.refresh_llm_nodes_ui()

    def refresh_agents_list_ui(self):
        self.agent_list_widget.clear()
        self.registered_agents = load_agents_registry()
        
        if not self.registered_agents:
            item = QListWidgetItem("등록된 에이전트가 없습니다. 상단의 [파일 찾아보기]로 에이전트를 추가하세요.")
            item.setFlags(Qt.NoItemFlags)
            self.agent_list_widget.addItem(item)
            return

        for idx, agent in enumerate(self.registered_agents):
            name = agent.get("name", "이름 없는 에이전트")
            path = agent.get("path", "")
            desc = agent.get("description", "설명 없음")
            agent_id = agent.get("id", "")
            
            # 아이템 카드 위젯 생성
            item_widget = QWidget()
            g_layout = QGridLayout(item_widget)
            g_layout.setAlignment(Qt.AlignTop)
            g_layout.setContentsMargins(14, 12, 14, 12)
            g_layout.setHorizontalSpacing(8)
            g_layout.setVerticalSpacing(4)

            # 1. 에이전트 이름 헤더 (상단 정렬)
            lbl_name = QLabel(name)
            lbl_name.setAlignment(Qt.AlignTop | Qt.AlignLeft)
            lbl_name.setStyleSheet("font-size: 14px; font-weight: bold; color: #ffffff; background: transparent; border: none;")
            g_layout.addWidget(lbl_name, 0, 0, 1, 2, Qt.AlignTop)

            # 2. 에이전트 ID (상단 정렬)
            lbl_id_key = QLabel("ID:")
            lbl_id_key.setFixedWidth(42)
            lbl_id_key.setAlignment(Qt.AlignTop | Qt.AlignLeft)
            lbl_id_key.setStyleSheet("font-size: 11px; font-weight: 600; color: #7dd3fc; background: transparent; border: none;")
            lbl_id_val = QLabel(agent_id)
            lbl_id_val.setAlignment(Qt.AlignTop | Qt.AlignLeft)
            lbl_id_val.setStyleSheet("font-size: 11px; font-family: monospace; color: #7dd3fc; background: transparent; border: none;")
            g_layout.addWidget(lbl_id_key, 1, 0, Qt.AlignTop)
            g_layout.addWidget(lbl_id_val, 1, 1, Qt.AlignTop)

            # 3. 경로 정보 (상단 정렬, 긴 경로 자동 줄바꿈)
            lbl_path_key = QLabel("경로:")
            lbl_path_key.setFixedWidth(42)
            lbl_path_key.setAlignment(Qt.AlignTop | Qt.AlignLeft)
            lbl_path_key.setStyleSheet("font-size: 11px; font-weight: 600; color: #94a3b8; background: transparent; border: none;")
            lbl_path_val = QLabel(path)
            lbl_path_val.setWordWrap(True)
            lbl_path_val.setAlignment(Qt.AlignTop | Qt.AlignLeft)
            lbl_path_val.setStyleSheet("font-size: 11px; color: #94a3b8; background: transparent; border: none;")
            g_layout.addWidget(lbl_path_key, 2, 0, Qt.AlignTop)
            g_layout.addWidget(lbl_path_val, 2, 1, Qt.AlignTop)

            # 4. 설명 정보 (상단 정렬, 긴 설명 자동 줄바꿈)
            lbl_desc_key = QLabel("설명:")
            lbl_desc_key.setFixedWidth(42)
            lbl_desc_key.setAlignment(Qt.AlignTop | Qt.AlignLeft)
            lbl_desc_key.setStyleSheet("font-size: 11px; font-weight: 600; color: #64748b; background: transparent; border: none;")
            lbl_desc_val = QLabel(desc)
            lbl_desc_val.setWordWrap(True)
            lbl_desc_val.setAlignment(Qt.AlignTop | Qt.AlignLeft)
            lbl_desc_val.setStyleSheet("font-size: 11px; color: #cbd5e1; background: transparent; border: none;")
            g_layout.addWidget(lbl_desc_key, 3, 0, Qt.AlignTop)
            g_layout.addWidget(lbl_desc_val, 3, 1, Qt.AlignTop)

            item = QListWidgetItem()
            item.setData(Qt.UserRole, agent)
            # 상단 정렬 상태에서 내부 텍스트 크기에 맞게 충분한 높이 계산
            item.setSizeHint(QSize(0, max(124, item_widget.sizeHint().height() + 8)))

            self.agent_list_widget.addItem(item)
            self.agent_list_widget.setItemWidget(item, item_widget)

            # 현재 활성화된 에이전트와 경로가 일치하면 자동 선택
            if self.selected_agent_path and (path == self.selected_agent_path or agent_id == self.selected_agent_path):
                self.agent_list_widget.setCurrentItem(item)

    def on_agent_item_clicked(self, item: QListWidgetItem):
        agent_data = item.data(Qt.UserRole)
        if not agent_data:
            return
        
        file_path = agent_data.get("path")
        if file_path and os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                self.workflow_dict = content
                self.workflow_path = file_path
                self.selected_agent_path = file_path
                self.txt_selected_file.setText(file_path)
                self.refresh_llm_nodes_ui()
            except Exception as e:
                QMessageBox.warning(self, "파일 열기 실패", f"에이전트 파일을 읽을 수 없습니다:\n{e}")
        else:
            QMessageBox.warning(self, "경로 오류", f"해당 에이전트 파일이 존재하지 않습니다:\n{file_path}")

    def on_browse_and_load_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "에이전트 워크플로우 JSON 선택", "", "JSON Files (*.json)"
        )
        if not file_path:
            return

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = json.load(f)

            meta = content.get("metadata", {})
            agent_id = meta.get("agent_id") or f"agent-{os.path.splitext(os.path.basename(file_path))[0]}"
            agent_name = meta.get("agent_name", os.path.basename(file_path))
            desc = meta.get("description", "")

            # 에이전트 목록에 등록 및 저장
            register_agent(agent_id=agent_id, agent_name=agent_name, file_path=file_path, description=desc)

            self.workflow_dict = content
            self.workflow_path = file_path
            self.selected_agent_path = file_path
            self.txt_selected_file.setText(file_path)

            self.refresh_agents_list_ui()
            self.refresh_llm_nodes_ui()

            QMessageBox.information(
                self,
                "로드 완료",
                f"에이전트 '{agent_name}'를 성공적으로 불러와 에이전트 목록에 추가했습니다."
            )
        except Exception as e:
            QMessageBox.critical(self, "오류", f"에이전트 파일을 로드하는 중 오류가 발생했습니다:\n{e}")

    def refresh_llm_nodes_ui(self):
        while self.scroll_layout.count():
            item = self.scroll_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        self.node_input_widgets.clear()

        if not self.workflow_dict:
            lbl = QLabel("에이전트 목록 탭에서 에이전트를 선택하거나 새 파일을 불러오세요.")
            lbl.setStyleSheet("color: #8c9ba5; padding: 20px; background: transparent; border: none;")
            lbl.setAlignment(Qt.AlignCenter)
            self.scroll_layout.addWidget(lbl)
            self.scroll_layout.addStretch()
            return

        llm_nodes = extract_llm_nodes(self.workflow_dict)
        if not llm_nodes:
            lbl = QLabel("현재 워크플로우에 LLM 또는 Agent 노드가 없습니다.")
            lbl.setStyleSheet("color: #8c9ba5; padding: 20px; background: transparent; border: none;")
            lbl.setAlignment(Qt.AlignCenter)
            self.scroll_layout.addWidget(lbl)
            self.scroll_layout.addStretch()
            return

        for node in llm_nodes:
            card = QFrame()
            card.setStyleSheet("""
                QFrame {
                    background-color: #171d27;
                    border: 1px solid #263345;
                    border-radius: 6px;
                    padding: 10px;
                }
            """)
            c_layout = QVBoxLayout(card)
            c_layout.setContentsMargins(10, 10, 10, 10)
            c_layout.setSpacing(8)

            lbl_header = QLabel(f"노드: <b>{node['label']}</b> (ID: {node['id']}, 타입: {node['type']})")
            lbl_header.setStyleSheet("color: #ffffff; font-size: 12px; background: transparent; border: none;")
            c_layout.addWidget(lbl_header)

            # 1. 모델명 입력 필드 (항상 직접 수정 가능하도록 상단에 배치)
            h_m = QHBoxLayout()
            lbl_m = QLabel("Model:")
            lbl_m.setFixedWidth(70)
            lbl_m.setStyleSheet("color: #4cd7f6; font-weight: bold;")
            h_m.addWidget(lbl_m)
            txt_model = QLineEdit()
            # 현재 노드에 실제로 설정되어 있는 모델명 표시
            txt_model.setText(node.get("model") or DEFAULT_MODEL)
            txt_model.setPlaceholderText("예: gemma2:2b, qwen2.5:7b, gpt-4o-mini")
            h_m.addWidget(txt_model)
            c_layout.addLayout(h_m)

            # 2. 외부 커스텀 API (Base URL, API Key) 사용 체크박스
            chk_custom = QCheckBox("외부 커스텀 API 엔드포인트 (Base URL, API Key) 사용")
            chk_custom.setChecked(node["is_custom"])
            c_layout.addWidget(chk_custom)

            custom_container = QWidget()
            cust_layout = QVBoxLayout(custom_container)
            cust_layout.setContentsMargins(0, 4, 0, 4)
            cust_layout.setSpacing(6)

            # Base URL
            h_u = QHBoxLayout()
            lbl_u = QLabel("Base URL:")
            lbl_u.setFixedWidth(70)
            h_u.addWidget(lbl_u)
            txt_url = QLineEdit()
            txt_url.setText(node.get("base_url", ""))
            txt_url.setPlaceholderText("예: https://api.openai.com/v1 (비워두면 기본값)")
            h_u.addWidget(txt_url)
            cust_layout.addLayout(h_u)

            # API Key
            h_k = QHBoxLayout()
            lbl_k = QLabel("API Key:")
            lbl_k.setFixedWidth(70)
            h_k.addWidget(lbl_k)
            txt_key = QLineEdit()
            txt_key.setEchoMode(QLineEdit.Password)
            txt_key.setText(node.get("api_key", ""))
            txt_key.setPlaceholderText("sk-...")
            h_k.addWidget(txt_key)
            cust_layout.addLayout(h_k)

            custom_container.setVisible(node["is_custom"])
            chk_custom.toggled.connect(custom_container.setVisible)

            c_layout.addWidget(custom_container)
            self.scroll_layout.addWidget(card)

            self.node_input_widgets[node["id"]] = {
                "chk_custom": chk_custom,
                "txt_model": txt_model,
                "txt_url": txt_url,
                "txt_key": txt_key,
                "node_info": node
            }

        self.scroll_layout.addStretch()

    def on_save_settings(self):
        # 테마 설정 저장
        selected_theme = "light" if self.radio_light.isChecked() else "dark"
        self.selected_theme = selected_theme
        set_app_theme(selected_theme)

        if not self.workflow_dict:
            self.accept()
            return

        updated_configs = {}
        for node_id, w in self.node_input_widgets.items():
            is_custom = w["chk_custom"].isChecked()
            # 사용자가 입력한 모델명을 항상 우선 적용
            model_val = w["txt_model"].text().strip() or (w["node_info"].get("model") or DEFAULT_MODEL)
            updated_configs[node_id] = {
                "is_custom": is_custom,
                "model": model_val,
                "base_url": w["txt_url"].text().strip() if is_custom else "",
                "api_key": w["txt_key"].text().strip() if is_custom else "",
                "temperature": float(w["node_info"].get("temperature", 0.7))
            }

        self.workflow_dict = update_llm_configs_in_workflow(
            self.workflow_dict, updated_configs, self.workflow_path
        )

        if self.workflow_path:
            set_last_agent_path(self.workflow_path)

        self.accept()


# -------------------------------------------------------------
# 메인 윈도우 (PySide6 MainWindow)
# -------------------------------------------------------------
class AgentRuntimeMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("NOA-E Agent Runtime")
        self.resize(1080, 740)

        self.current_theme = get_app_theme()
        self.apply_theme(self.current_theme)

        self.current_agent_id: Optional[str] = None
        self.current_agent_name: str = "Local Agent"
        self.sessions: List[Dict[str, Any]] = []
        self.current_session_id: Optional[str] = None
        self.is_new_chat_mode: bool = False

        self.workflow_dict = None
        self.workflow_path = None
        self.compiled_graph = None
        
        # 활성 실행 상태 관리 (세션별 격리 및 복원용)
        self.active_executions: Dict[str, Dict[str, Any]] = {}
        self.current_worker: Optional[AgentExecutionWorker] = None
        
        self.loading_bubble = None
        self.live_thought_widget = None

        self.init_ui()
        self.load_default_or_last_workflow()

    def apply_theme(self, theme: str):
        self.current_theme = theme
        app = QApplication.instance()
        if app:
            app.setStyleSheet(LIGHT_STYLESHEET if theme == "light" else DARK_STYLESHEET)
        else:
            self.setStyleSheet(LIGHT_STYLESHEET if theme == "light" else DARK_STYLESHEET)

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # -----------------------------
        # 1. 좌측 사이드바
        # -----------------------------
        sidebar = QFrame()
        sidebar.setObjectName("SidebarFrame")
        sidebar.setFixedWidth(280)
        s_layout = QVBoxLayout(sidebar)
        s_layout.setContentsMargins(18, 20, 18, 18)
        s_layout.setSpacing(12)

        # 서비스명
        lbl_brand = QLabel("NOA-E Runtime")
        lbl_brand.setObjectName("AppBrandLabel")
        s_layout.addWidget(lbl_brand)

        # 에이전트 이름
        self.lbl_agent_name = QLabel("에이전트 미로드")
        self.lbl_agent_name.setObjectName("AgentTitle")
        self.lbl_agent_name.setWordWrap(True)
        s_layout.addWidget(self.lbl_agent_name)

        # 에이전트 설명
        self.lbl_agent_desc = QLabel("하단 설정에서 에이전트를 불러와주세요.")
        self.lbl_agent_desc.setObjectName("AgentDesc")
        self.lbl_agent_desc.setWordWrap(True)
        s_layout.addWidget(self.lbl_agent_desc)

        s_layout.addSpacing(6)

        # 새로운 대화 버튼
        btn_new_chat = QPushButton("새로운 대화")
        btn_new_chat.setObjectName("PrimaryButton")
        btn_new_chat.clicked.connect(self.on_click_new_chat_button)
        s_layout.addWidget(btn_new_chat)

        lbl_sess_header = QLabel("대화 목록")
        lbl_sess_header.setStyleSheet("color: #7a889b; font-size: 11px; font-weight: bold; margin-top: 10px; background: transparent; border: none;")
        s_layout.addWidget(lbl_sess_header)

        # 세션 목록 스크롤 영역
        self.scroll_sessions = QScrollArea()
        self.scroll_sessions.setWidgetResizable(True)
        self.scroll_sessions.setFrameShape(QFrame.NoFrame)
        self.sessions_container = QWidget()
        self.sessions_layout = QVBoxLayout(self.sessions_container)
        self.sessions_layout.setContentsMargins(0, 0, 0, 0)
        self.sessions_layout.setSpacing(6)
        self.sessions_layout.addStretch()
        self.scroll_sessions.setWidget(self.sessions_container)
        s_layout.addWidget(self.scroll_sessions)

        # 좌측 하단 설정 버튼
        btn_settings = QPushButton("에이전트 로드 / 설정")
        btn_settings.setObjectName("SettingsButton")
        btn_settings.clicked.connect(self.on_open_settings)
        s_layout.addWidget(btn_settings)

        main_layout.addWidget(sidebar)

        # -----------------------------
        # 2. 우측 메인 대화 영역
        # -----------------------------
        right_panel = QWidget()
        r_layout = QVBoxLayout(right_panel)
        r_layout.setContentsMargins(0, 0, 0, 0)
        r_layout.setSpacing(0)

        # 상단 헤더 (제목만 표시)
        header = QFrame()
        header.setObjectName("ChatHeader")
        h_layout = QHBoxLayout(header)
        h_layout.setContentsMargins(22, 16, 22, 16)
        self.lbl_chat_title = QLabel("새로운 대화")
        self.lbl_chat_title.setObjectName("ChatHeaderLabel")
        h_layout.addWidget(self.lbl_chat_title)
        h_layout.addStretch()
        r_layout.addWidget(header)

        # 중앙 메시지 영역
        self.chat_scroll = QScrollArea()
        self.chat_scroll.setWidgetResizable(True)
        self.chat_scroll.setFrameShape(QFrame.NoFrame)
        self.chat_scroll_content = QWidget()
        self.chat_messages_layout = QVBoxLayout(self.chat_scroll_content)
        self.chat_messages_layout.setContentsMargins(24, 24, 24, 24)
        self.chat_messages_layout.setSpacing(16)
        self.chat_messages_layout.addStretch()
        self.chat_scroll.setWidget(self.chat_scroll_content)
        r_layout.addWidget(self.chat_scroll)

        # 하단 입력 영역
        self.input_container = QFrame()
        self.input_container.setObjectName("InputContainerFrame")
        in_layout = QHBoxLayout(self.input_container)
        in_layout.setContentsMargins(0, 0, 0, 0)
        in_layout.setSpacing(10)

        self.txt_input = QLineEdit()
        self.txt_input.setPlaceholderText("에이전트에게 메시지를 입력하세요... (Enter 키로 전송)")
        self.txt_input.returnPressed.connect(self.on_submit_or_stop)
        in_layout.addWidget(self.txt_input)

        self.btn_action = QPushButton("전송")
        self.btn_action.setObjectName("PrimaryButton")
        self.btn_action.setFixedWidth(84)
        self.btn_action.clicked.connect(self.on_submit_or_stop)
        in_layout.addWidget(self.btn_action)

        r_layout.addWidget(self.input_container)
        main_layout.addWidget(right_panel)

    def load_default_or_last_workflow(self):
        # 1. 가장 마지막에 사용했던 에이전트 경로 확인
        last_path = get_last_agent_path()
        target_path = None

        if last_path and os.path.exists(last_path):
            target_path = last_path
        else:
            sample_path = os.path.join(current_dir, "sample_agent.json")
            if os.path.exists(sample_path):
                target_path = sample_path

        if target_path and os.path.exists(target_path):
            try:
                with open(target_path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                self.workflow_dict = content
                self.workflow_path = target_path
                self.compile_and_update_agent(content, target_path)
            except Exception as e:
                print(f"Failed to auto-load workflow: {e}")

    def compile_and_update_agent(self, workflow_dict: dict, file_path: Optional[str] = None):
        try:
            compiler = WorkflowCompiler()
            type_map = {
                "inputNode": "input",
                "llmNode": "llm",
                "outputNode": "output",
                "searchNode": "search",
                "calculatorNode": "calculator",
                "agentNode": "agent"
            }
            normalized_wf = {
                "nodes": [
                    {
                        "id": n.get("id"),
                        "type": type_map.get(n.get("type"), n.get("type")),
                        "label": n.get("label") or n.get("data", {}).get("label"),
                        "config": n.get("config", {}) or n.get("data", {}).get("config", {})
                    }
                    for n in workflow_dict.get("nodes", [])
                ],
                "edges": [
                    {"source": e.get("source"), "target": e.get("target")}
                    for e in workflow_dict.get("edges", [])
                ]
            }
            self.compiled_graph = compiler.compile_workflow(normalized_wf)
            
            meta = workflow_dict.get("metadata", {})
            self.current_agent_name = meta.get("agent_name", "Local Agent")
            agent_desc = meta.get("description", "설명 없음")
            
            # Agent ID 설정 (없으면 파일명 기반 고유 ID 생성)
            fallback_id = f"agent-{os.path.splitext(os.path.basename(file_path))[0]}" if file_path else "default-agent"
            self.current_agent_id = meta.get("agent_id") or fallback_id

            if file_path:
                register_agent(
                    agent_id=self.current_agent_id,
                    agent_name=self.current_agent_name,
                    file_path=file_path,
                    description=agent_desc
                )

            self.lbl_agent_name.setText(self.current_agent_name)
            self.lbl_agent_desc.setText(agent_desc)

            # 에이전트별 대화 세션 기록 로드
            self.sessions = load_sessions(self.current_agent_id)
            self.current_session_id = self.sessions[0]["id"] if self.sessions else None
            self.is_new_chat_mode = False
            
            self.refresh_sessions_list_ui()
            self.render_current_session_messages()
            return True, ""
        except Exception as e:
            self.lbl_agent_name.setText("컴파일 실패")
            self.lbl_agent_desc.setText(str(e))
            return False, str(e)

    def refresh_sessions_list_ui(self):
        while self.sessions_layout.count() > 1:
            item = self.sessions_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        self.sessions = load_sessions(self.current_agent_id)
        for s in self.sessions:
            is_selected = (s["id"] == self.current_session_id and not self.is_new_chat_mode)
            item_widget = SessionListItemWidget(s["id"], s["title"], is_selected)
            item_widget.selected_signal.connect(self.on_session_selected)
            item_widget.deleted_signal.connect(self.on_session_deleted)
            idx = max(0, self.sessions_layout.count() - 1)
            self.sessions_layout.insertWidget(idx, item_widget)

    def on_session_selected(self, session_id: str):
        self.is_new_chat_mode = False
        self.current_session_id = session_id
        self.refresh_sessions_list_ui()
        self.render_current_session_messages()

    def on_click_new_chat_button(self):
        self.is_new_chat_mode = True
        self.current_session_id = None
        self.refresh_sessions_list_ui()
        self.render_current_session_messages()
        self.txt_input.setFocus()

    def on_session_deleted(self, session_id: str):
        if self.current_agent_id:
            delete_session(self.current_agent_id, session_id)
            self.sessions = load_sessions(self.current_agent_id)
            if self.current_session_id == session_id:
                self.current_session_id = self.sessions[0]["id"] if self.sessions else None
                self.is_new_chat_mode = False
            self.refresh_sessions_list_ui()
            self.render_current_session_messages()

    def on_open_settings(self):
        dialog = SettingsDialog(self, self.workflow_dict, self.workflow_path)
        if dialog.exec() == QDialog.Accepted:
            if hasattr(dialog, "selected_theme") and dialog.selected_theme != self.current_theme:
                self.apply_theme(dialog.selected_theme)
                self.refresh_sessions_list_ui()
                self.render_current_session_messages()

            self.workflow_dict = dialog.workflow_dict
            self.workflow_path = dialog.workflow_path
            if self.workflow_dict:
                success, err = self.compile_and_update_agent(self.workflow_dict, self.workflow_path)
                if not success:
                    QMessageBox.critical(self, "컴파일 오류", f"에이전트 컴파일에 실패했습니다:\n{err}")

    def render_current_session_messages(self):
        while self.chat_messages_layout.count() > 1:
            item = self.chat_messages_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        self.loading_bubble = None
        self.live_thought_widget = None

        has_sessions = len(self.sessions) > 0
        is_active = has_sessions or self.is_new_chat_mode

        # 세션 0개이고 새 대화 모드가 아닐 때 입력창 숨김
        self.input_container.setVisible(is_active)

        if not self.current_session_id:
            self.lbl_chat_title.setText("새로운 대화")
            if self.is_new_chat_mode:
                placeholder = QLabel("새로운 대화를 시작해주세요.\n아래 입력창에 메시지를 입력하여 대화를 시작할 수 있습니다.")
            else:
                placeholder = QLabel("대화 목록이 없습니다.\n상단의 [새로운 대화] 버튼을 눌러 대화를 시작하세요.")
            placeholder.setAlignment(Qt.AlignCenter)
            placeholder.setStyleSheet("color: #7a889b; font-size: 14px; padding: 60px; line-height: 1.6; background: transparent; border: none;")
            self.chat_messages_layout.insertWidget(0, placeholder)
            self.set_executing_state(False)
            return

        curr = next((s for s in self.sessions if s["id"] == self.current_session_id), None)
        if not curr:
            self.current_session_id = None
            self.render_current_session_messages()
            return

        self.lbl_chat_title.setText(curr["title"])

        messages = curr.get("messages", [])
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            logs = msg.get("logs", [])
            self.add_message_bubble(role, content, logs)

        # 만약 이 세션이 현재 실행 중인 상태라면 진행 중인 로그/로딩 버블 복원
        if self.current_session_id in self.active_executions:
            exec_state = self.active_executions[self.current_session_id]
            if exec_state.get("is_running", False):
                self.set_executing_state(True)
                active_logs = exec_state.get("logs", [])
                if active_logs:
                    self._create_live_bubble(active_logs)
                else:
                    self.loading_bubble = PureDotsAnimationWidget()
                    idx = max(0, self.chat_messages_layout.count() - 1)
                    self.chat_messages_layout.insertWidget(idx, self.loading_bubble)
            else:
                self.set_executing_state(False)
        else:
            self.set_executing_state(False)

        if not messages and self.current_session_id not in self.active_executions:
            placeholder = QLabel("에이전트에게 질문이나 메시지를 입력하세요.")
            placeholder.setAlignment(Qt.AlignCenter)
            placeholder.setStyleSheet("color: #7a889b; font-size: 13px; padding: 40px; background: transparent; border: none;")
            self.chat_messages_layout.insertWidget(0, placeholder)

        QApplication.processEvents()
        self.chat_scroll.verticalScrollBar().setValue(
            self.chat_scroll.verticalScrollBar().maximum()
        )

    def add_message_bubble(self, role: str, text: str, logs: list = None):
        is_user = (role == "user")

        row_widget = QWidget()
        row_widget.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        row_layout = QHBoxLayout(row_widget)
        row_layout.setContentsMargins(0, 0, 0, 0)
        row_layout.setSpacing(0)
        row_layout.setAlignment(Qt.AlignTop)

        bubble_frame = QFrame()
        bubble_frame.setObjectName("UserBubbleFrame" if is_user else "AgentBubbleFrame")

        b_layout = QVBoxLayout(bubble_frame)

        if is_user:
            row_layout.addStretch(1)
            b_layout.setContentsMargins(14, 10, 14, 10)
            b_layout.setSpacing(0)
            bubble_frame.setMaximumWidth(540)
            bubble_frame.setSizePolicy(QSizePolicy.Maximum, QSizePolicy.Maximum)
            
            lbl_text = QLabel(text)
            lbl_text.setWordWrap(True)
            lbl_text.setTextInteractionFlags(Qt.TextSelectableByMouse)
            lbl_text.setStyleSheet("font-size: 13px; line-height: 1.45; background: transparent; border: none;")
            b_layout.addWidget(lbl_text)

            row_layout.addWidget(bubble_frame)
        else:
            b_layout.setAlignment(Qt.AlignTop)
            b_layout.setContentsMargins(16, 12, 16, 12)
            b_layout.setSpacing(6)
            bubble_frame.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)

            if logs:
                thought_widget = ThoughtLogToggleWidget(logs, is_live=False)
                b_layout.addWidget(thought_widget)

            lbl_text = QLabel(text)
            lbl_text.setWordWrap(True)
            lbl_text.setTextInteractionFlags(Qt.TextSelectableByMouse)
            lbl_text.setStyleSheet("font-size: 13px; line-height: 1.45; background: transparent; border: none;")
            b_layout.addWidget(lbl_text)

            row_layout.addWidget(bubble_frame, 8)
            row_layout.addStretch(2)

        idx = max(0, self.chat_messages_layout.count() - 1)
        self.chat_messages_layout.insertWidget(idx, row_widget)

    def on_submit_or_stop(self):
        # 1. 만약 현재 실행 중이라면 정지(Stop) 수행
        if self.current_worker and self.current_worker.isRunning():
            self.current_worker.stop()
            self.current_worker.wait(500)
            self.set_executing_state(False)
            return

        # 2. 전송(Send) 수행
        text = self.txt_input.text().strip()
        if not text:
            return

        if not self.compiled_graph or not self.current_agent_id:
            QMessageBox.warning(self, "에이전트 미로드", "실행 가능한 에이전트가 없습니다.\n좌측 하단 [에이전트 로드 / 설정]에서 워크플로우를 불러와주세요.")
            return

        # 새 세션 모드였다면 실제 세션 생성
        if not self.current_session_id or self.is_new_chat_mode:
            title = text[:18]
            new_s = create_new_session(
                agent_id=self.current_agent_id,
                title=title,
                agent_name=self.current_agent_name
            )
            self.current_session_id = new_s["id"]
            self.is_new_chat_mode = False
            self.sessions = load_sessions(self.current_agent_id)
            self.refresh_sessions_list_ui()

        curr_session = next((s for s in self.sessions if s["id"] == self.current_session_id), None)
        if not curr_session:
            return

        # 첫 질문인 경우 세션 제목 업데이트
        if len(curr_session.get("messages", [])) == 0:
            curr_session["title"] = text[:18]
            self.lbl_chat_title.setText(curr_session["title"])
            self.refresh_sessions_list_ui()

        self.txt_input.clear()
        self.set_executing_state(True)

        # 기존 플레이스홀더 라벨 제거
        if len(curr_session.get("messages", [])) == 0:
            while self.chat_messages_layout.count() > 1:
                item = self.chat_messages_layout.takeAt(0)
                if item.widget():
                    item.widget().deleteLater()

        # 1. 사용자 메시지 버블 추가 및 에이전트별 파일 영구 저장
        self.add_message_bubble("user", text)
        curr_session["messages"].append({
            "role": "user",
            "content": text,
            "created_at": datetime.now().isoformat()
        })
        update_session_messages(
            self.current_agent_id,
            curr_session["id"],
            curr_session["messages"],
            title=curr_session["title"]
        )

        # 2. 점(...) 애니메이션 말풍선 표시
        self.loading_bubble = PureDotsAnimationWidget()
        idx = max(0, self.chat_messages_layout.count() - 1)
        self.chat_messages_layout.insertWidget(idx, self.loading_bubble)

        QApplication.processEvents()
        self.chat_scroll.verticalScrollBar().setValue(
            self.chat_scroll.verticalScrollBar().maximum()
        )

        # 3. 비동기 Worker 실행 & active_executions에 등록
        target_sid = self.current_session_id
        self.active_executions[target_sid] = {
            "is_running": True,
            "logs": [],
            "user_text": text
        }

        history_messages = curr_session["messages"][:-1]
        self.current_worker = AgentExecutionWorker(
            session_id=target_sid,
            compiled_graph=self.compiled_graph,
            user_input=text,
            conversation_messages=history_messages
        )
        self.current_worker.step_log_signal.connect(self.on_agent_step_log)
        self.current_worker.finished_signal.connect(self.on_agent_finished)
        self.current_worker.error_signal.connect(self.on_agent_error)
        self.current_worker.start()

    def set_executing_state(self, is_running: bool):
        if is_running:
            self.btn_action.setText("정지")
            self.btn_action.setObjectName("StopButton")
            self.btn_action.setStyle(self.btn_action.style())
            self.txt_input.setEnabled(False)
        else:
            self.btn_action.setText("전송")
            self.btn_action.setObjectName("PrimaryButton")
            self.btn_action.setStyle(self.btn_action.style())
            self.txt_input.setEnabled(True)
            self.txt_input.setFocus()

    def _create_live_bubble(self, initial_logs: list):
        row_widget = QWidget()
        row_widget.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        row_layout = QHBoxLayout(row_widget)
        row_layout.setContentsMargins(0, 0, 0, 0)
        row_layout.setSpacing(0)
        row_layout.setAlignment(Qt.AlignTop)

        bubble_frame = QFrame()
        bubble_frame.setObjectName("AgentBubbleFrame")
        bubble_frame.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)

        b_layout = QVBoxLayout(bubble_frame)
        b_layout.setAlignment(Qt.AlignTop)
        b_layout.setContentsMargins(16, 12, 16, 12)
        b_layout.setSpacing(6)

        self.live_thought_widget = ThoughtLogToggleWidget(initial_logs, is_live=True)
        b_layout.addWidget(self.live_thought_widget)

        self.live_response_label = QLabel("")
        self.live_response_label.setWordWrap(True)
        self.live_response_label.setTextInteractionFlags(Qt.TextSelectableByMouse)
        self.live_response_label.setStyleSheet("font-size: 13px; line-height: 1.45; background: transparent; border: none;")
        self.live_response_label.setVisible(False)
        b_layout.addWidget(self.live_response_label)

        row_layout.addWidget(bubble_frame, 8)
        row_layout.addStretch(2)

        idx = max(0, self.chat_messages_layout.count() - 1)
        self.chat_messages_layout.insertWidget(idx, row_widget)

    @Slot(str, str, str)
    def on_agent_step_log(self, session_id: str, node_name: str, log_message: str):
        if session_id in self.active_executions:
            self.active_executions[session_id]["logs"].append(log_message)

        if self.current_session_id != session_id:
            return

        if node_name == "input":
            return

        if self.loading_bubble:
            self.loading_bubble.stop()
            self.loading_bubble.deleteLater()
            self.loading_bubble = None

        if not self.live_thought_widget:
            accum_logs = self.active_executions.get(session_id, {}).get("logs", [log_message])
            self._create_live_bubble(accum_logs)
        else:
            self.live_thought_widget.append_log(log_message)

        QApplication.processEvents()
        self.chat_scroll.verticalScrollBar().setValue(
            self.chat_scroll.verticalScrollBar().maximum()
        )

    @Slot(str, str, list)
    def on_agent_finished(self, session_id: str, output: str, logs: list):
        if session_id in self.active_executions:
            self.active_executions[session_id]["is_running"] = False

        if self.current_agent_id:
            all_sessions = load_sessions(self.current_agent_id)
            target_s = next((s for s in all_sessions if s["id"] == session_id), None)
            if target_s:
                target_s["messages"].append({
                    "role": "assistant",
                    "content": output,
                    "logs": logs,
                    "created_at": datetime.now().isoformat()
                })
                update_session_messages(
                    self.current_agent_id,
                    target_s["id"],
                    target_s["messages"],
                    logs=logs,
                    title=target_s["title"]
                )

            self.sessions = load_sessions(self.current_agent_id)

        if self.current_session_id == session_id:
            if self.loading_bubble:
                self.loading_bubble.stop()
                self.loading_bubble.deleteLater()
                self.loading_bubble = None

            if self.live_thought_widget:
                self.live_thought_widget.finalize()
                self.live_response_label.setText(output)
                self.live_response_label.setVisible(True)
                self.live_thought_widget = None
                self.live_response_label = None
            else:
                self.add_message_bubble("assistant", output, logs)

            QApplication.processEvents()
            self.chat_scroll.verticalScrollBar().setValue(
                self.chat_scroll.verticalScrollBar().maximum()
            )

        self.set_executing_state(False)

    @Slot(str, str)
    def on_agent_error(self, session_id: str, err_msg: str):
        if session_id in self.active_executions:
            self.active_executions[session_id]["is_running"] = False

        if self.current_agent_id:
            all_sessions = load_sessions(self.current_agent_id)
            target_s = next((s for s in all_sessions if s["id"] == session_id), None)
            if target_s:
                target_s["messages"].append({
                    "role": "assistant",
                    "content": f"오류로 인해 응답을 생성하지 못했습니다:\n{err_msg}",
                    "logs": [f"Error: {err_msg}"],
                    "created_at": datetime.now().isoformat()
                })
                update_session_messages(
                    self.current_agent_id,
                    target_s["id"],
                    target_s["messages"],
                    title=target_s["title"]
                )

            self.sessions = load_sessions(self.current_agent_id)

        if self.current_session_id == session_id:
            if self.loading_bubble:
                self.loading_bubble.stop()
                self.loading_bubble.deleteLater()
                self.loading_bubble = None

            if self.live_thought_widget:
                self.live_thought_widget.finalize()
                self.live_response_label.setText(f"오류 발생:\n{err_msg}")
                self.live_response_label.setVisible(True)
                self.live_thought_widget = None
                self.live_response_label = None
            else:
                self.add_message_bubble("assistant", f"오류 발생:\n{err_msg}")

        self.set_executing_state(False)


def launch_gui():
    app = QApplication(sys.argv)
    window = AgentRuntimeMainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    launch_gui()
