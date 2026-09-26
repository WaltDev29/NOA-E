import sys
import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QLineEdit, QScrollArea, QFrame,
    QDialog, QFileDialog, QMessageBox, QCheckBox, QGroupBox, QSizePolicy
)
from PySide6.QtCore import Qt, QThread, Signal, Slot, QTimer, QEvent
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
        load_sessions, create_new_session, delete_session,
        update_session_messages, extract_llm_nodes, update_llm_configs_in_workflow
    )
    from runtime.config import DEFAULT_SERVER_OLLAMA_URL, DEFAULT_MODEL
except ModuleNotFoundError:
    from core.engine.compiler import WorkflowCompiler
    from storage import (
        load_sessions, create_new_session, delete_session,
        update_session_messages, extract_llm_nodes, update_llm_configs_in_workflow
    )
    from config import DEFAULT_SERVER_OLLAMA_URL, DEFAULT_MODEL


# -------------------------------------------------------------
# 깔끔하고 통일된 다크 모드 스타일시트 (배경 투명화 및 일관성 보장)
# -------------------------------------------------------------
DARK_STYLESHEET = """
QMainWindow, QWidget {
    background-color: #11151c;
    color: #e6edf3;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Malgun Gothic", sans-serif;
    font-size: 13px;
}

QLabel {
    background-color: transparent;
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
}

#AgentTitle {
    font-size: 14px;
    font-weight: bold;
    color: #ffffff;
    background-color: transparent;
}

#AgentDesc {
    font-size: 11px;
    color: #8c9ba5;
    line-height: 1.35;
    background-color: transparent;
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

/* Dialog */
QDialog {
    background-color: #141923;
}
"""


# -------------------------------------------------------------
# 실시간 스트리밍 지원 비동기 실행 워커 (QThread)
# -------------------------------------------------------------
class AgentExecutionWorker(QThread):
    step_log_signal = Signal(str, str)         # session_id, log_message
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
                    self.step_log_signal.emit(self.session_id, "[시스템] 사용자에 의해 생성이 중단되었습니다.")
                    final_output = "사용자에 의해 응답 생성이 중단되었습니다."
                    break

                # chunk is a dict: {node_name: {state_keys...}}
                for node_name, state_update in chunk.items():
                    if "logs" in state_update and state_update["logs"]:
                        for log_line in state_update["logs"]:
                            accumulated_logs.append(log_line)
                            self.step_log_signal.emit(self.session_id, log_line)

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
        self.is_expanded = is_live  # 실행 중에는 펼침, 완료 후에는 접힘
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 8)
        layout.setSpacing(4)

        self.btn_toggle = QPushButton("사고 과정 보기" if not self.is_expanded else "사고 과정 접기")
        self.btn_toggle.setStyleSheet("""
            QPushButton {
                background-color: #171f2b;
                border: 1px solid #263245;
                border-radius: 4px;
                color: #8bb8ff;
                font-size: 11px;
                font-weight: bold;
                text-align: left;
                padding: 6px 10px;
            }
            QPushButton:hover {
                background-color: #1f2a3a;
                border-color: #4d8eff;
            }
        """)
        self.btn_toggle.setCursor(QCursor(Qt.PointingHandCursor))
        self.btn_toggle.clicked.connect(self.toggle)
        layout.addWidget(self.btn_toggle)

        self.content_box = QFrame()
        self.content_box.setStyleSheet("""
            QFrame {
                background-color: #0d121a;
                border: 1px solid #202a3a;
                border-radius: 4px;
                padding: 8px;
            }
        """)
        self.c_layout = QVBoxLayout(self.content_box)
        self.c_layout.setContentsMargins(6, 6, 6, 6)
        self.c_layout.setSpacing(4)

        for log in self.logs:
            self._append_log_label(log)

        self.content_box.setVisible(self.is_expanded)
        layout.addWidget(self.content_box)

    def _append_log_label(self, log_text: str):
        lbl = QLabel(f"• {log_text}")
        lbl.setWordWrap(True)
        lbl.setTextInteractionFlags(Qt.TextSelectableByMouse)
        lbl.setStyleSheet("color: #9cb0c9; font-family: monospace; font-size: 11px; line-height: 1.35; background: transparent;")
        self.c_layout.addWidget(lbl)

    def append_log(self, log_text: str):
        self.logs.append(log_text)
        self._append_log_label(log_text)

    def collapse(self):
        self.is_expanded = False
        self.btn_toggle.setText("사고 과정 보기")
        self.content_box.setVisible(False)

    def toggle(self):
        self.is_expanded = not self.is_expanded
        if self.is_expanded:
            self.btn_toggle.setText("사고 과정 접기")
            self.content_box.setVisible(True)
        else:
            self.btn_toggle.setText("사고 과정 보기")
            self.content_box.setVisible(False)


# -------------------------------------------------------------
# 순수 점(...) 깜빡임 애니메이션 위젯 (텍스트 없이 순수 도트만)
# -------------------------------------------------------------
class PureDotsAnimationWidget(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setStyleSheet("""
            QFrame {
                background-color: #171d27;
                border: 1px solid #232d3e;
                border-radius: 8px;
                margin-right: 120px;
                padding: 8px 14px;
            }
        """)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(12, 6, 12, 6)
        layout.setSpacing(6)

        self.lbl_dots = QLabel(". . .")
        self.lbl_dots.setStyleSheet("color: #4d8eff; font-size: 18px; font-weight: bold; background: transparent;")
        layout.addWidget(self.lbl_dots)
        layout.addStretch()

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
        self.lbl_title.setStyleSheet("font-size: 12px; color: #e6edf3; font-weight: 500; background: transparent;")
        f_layout.addWidget(self.lbl_title, 1)

        self.btn_del = QPushButton("삭제")
        self.btn_del.setObjectName("SessionDeleteBtn")
        self.btn_del.setToolTip("대화 삭제")
        self.btn_del.setCursor(QCursor(Qt.PointingHandCursor))
        self.btn_del.setVisible(False)  # 기본 숨김 (호버 시 표시)
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
# 단일 화면으로 통합된 에이전트 설정 다이얼로그 (이모티콘 제거)
# -------------------------------------------------------------
class SettingsDialog(QDialog):
    def __init__(self, parent=None, workflow_dict=None, workflow_path=None):
        super().__init__(parent)
        self.setWindowTitle("에이전트 로드 및 LLM 노드 설정")
        self.resize(680, 560)
        self.workflow_dict = workflow_dict
        self.workflow_path = workflow_path
        self.node_input_widgets = {}

        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(16)

        # -----------------------------
        # 1. 상단: 에이전트 로드 영역
        # -----------------------------
        grp_load = QGroupBox("에이전트 파일 로드")
        grp_load.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 1px solid #283548;
                border-radius: 6px;
                padding-top: 14px;
                color: #4d8eff;
                background-color: transparent;
            }
        """)
        g_load_layout = QVBoxLayout(grp_load)
        g_load_layout.setContentsMargins(12, 12, 12, 12)
        g_load_layout.setSpacing(8)

        h_file = QHBoxLayout()
        self.txt_file_path = QLineEdit()
        self.txt_file_path.setReadOnly(True)
        self.txt_file_path.setPlaceholderText("선택된 워크플로우 JSON 파일 없음")
        if self.workflow_path:
            self.txt_file_path.setText(self.workflow_path)
        h_file.addWidget(self.txt_file_path)

        btn_browse = QPushButton("에이전트 로드")
        btn_browse.setObjectName("PrimaryButton")
        btn_browse.clicked.connect(self.on_browse_and_load_file)
        h_file.addWidget(btn_browse)
        g_load_layout.addLayout(h_file)

        main_layout.addWidget(grp_load)

        # -----------------------------
        # 2. 중단: LLM 노드 설정 영역
        # -----------------------------
        grp_llm = QGroupBox("LLM 노드 설정")
        grp_llm.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 1px solid #283548;
                border-radius: 6px;
                padding-top: 14px;
                color: #4cd7f6;
                background-color: transparent;
            }
        """)
        g_llm_layout = QVBoxLayout(grp_llm)
        g_llm_layout.setContentsMargins(12, 12, 12, 12)
        g_llm_layout.setSpacing(8)

        self.scroll_llm = QScrollArea()
        self.scroll_llm.setWidgetResizable(True)
        self.scroll_llm.setFrameShape(QFrame.NoFrame)
        self.scroll_content = QWidget()
        self.scroll_layout = QVBoxLayout(self.scroll_content)
        self.scroll_layout.setContentsMargins(0, 0, 0, 0)
        self.scroll_layout.setSpacing(12)
        self.scroll_llm.setWidget(self.scroll_content)
        g_llm_layout.addWidget(self.scroll_llm)

        main_layout.addWidget(grp_llm)

        # -----------------------------
        # 3. 하단: [저장] & [닫기]
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

    def on_browse_and_load_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "에이전트 워크플로우 JSON 선택", "", "JSON Files (*.json)"
        )
        if not file_path:
            return

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = json.load(f)
            self.workflow_dict = content
            self.workflow_path = file_path
            self.txt_file_path.setText(file_path)
            self.refresh_llm_nodes_ui()
            QMessageBox.information(
                self,
                "로드 완료",
                f"에이전트 '{content.get('metadata', {}).get('agent_name', os.path.basename(file_path))}'를 성공적으로 불러왔습니다."
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
            lbl = QLabel("상단의 [에이전트 로드] 버튼을 눌러 워크플로우 JSON 파일을 불러오세요.")
            lbl.setStyleSheet("color: #8c9ba5; padding: 20px; background: transparent;")
            lbl.setAlignment(Qt.AlignCenter)
            self.scroll_layout.addWidget(lbl)
            self.scroll_layout.addStretch()
            return

        llm_nodes = extract_llm_nodes(self.workflow_dict)
        if not llm_nodes:
            lbl = QLabel("현재 워크플로우에 LLM 또는 Agent 노드가 없습니다.")
            lbl.setStyleSheet("color: #8c9ba5; padding: 20px; background: transparent;")
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
            lbl_header.setStyleSheet("color: #ffffff; font-size: 12px; background: transparent;")
            c_layout.addWidget(lbl_header)

            chk_custom = QCheckBox("외부 커스텀 LLM API 사용")
            chk_custom.setChecked(node["is_custom"])
            c_layout.addWidget(chk_custom)

            custom_container = QWidget()
            cust_layout = QVBoxLayout(custom_container)
            cust_layout.setContentsMargins(0, 4, 0, 4)
            cust_layout.setSpacing(6)

            # Model
            h_m = QHBoxLayout()
            lbl_m = QLabel("Model:")
            lbl_m.setFixedWidth(70)
            h_m.addWidget(lbl_m)
            txt_model = QLineEdit()
            txt_model.setText(node["model"] if node["model"] != DEFAULT_MODEL else "gpt-4o-mini")
            txt_model.setPlaceholderText("예: gpt-4o-mini, claude-3-5-sonnet")
            h_m.addWidget(txt_model)
            cust_layout.addLayout(h_m)

            # Base URL
            h_u = QHBoxLayout()
            lbl_u = QLabel("Base URL:")
            lbl_u.setFixedWidth(70)
            h_u.addWidget(lbl_u)
            txt_url = QLineEdit()
            txt_url.setText(node["base_url"])
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
            txt_key.setText(node["api_key"])
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
        if not self.workflow_dict:
            QMessageBox.warning(self, "경고", "먼저 에이전트 파일을 로드해주세요.")
            return

        updated_configs = {}
        for node_id, w in self.node_input_widgets.items():
            is_custom = w["chk_custom"].isChecked()
            updated_configs[node_id] = {
                "is_custom": is_custom,
                "model": w["txt_model"].text().strip() if is_custom else (w["node_info"].get("model") or DEFAULT_MODEL),
                "base_url": w["txt_url"].text().strip() if is_custom else "",
                "api_key": w["txt_key"].text().strip() if is_custom else "",
                "temperature": float(w["node_info"].get("temperature", 0.7))
            }

        self.workflow_dict = update_llm_configs_in_workflow(
            self.workflow_dict, updated_configs, self.workflow_path
        )
        self.accept()


# -------------------------------------------------------------
# 메인 윈도우 (PySide6 MainWindow)
# -------------------------------------------------------------
class AgentRuntimeMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("NOA-E Agent Runtime")
        self.resize(1080, 740)
        self.setStyleSheet(DARK_STYLESHEET)

        self.sessions = load_sessions()
        self.current_session_id = self.sessions[0]["id"] if self.sessions else None
        self.is_new_chat_mode = False  # 새 대화 생성 대기 모드

        self.workflow_dict = None
        self.workflow_path = None
        self.compiled_graph = None
        
        self.current_worker = None
        self.loading_bubble = None
        self.live_thought_widget = None

        self.init_ui()
        self.load_default_or_last_workflow()

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
        lbl_sess_header.setStyleSheet("color: #7a889b; font-size: 11px; font-weight: bold; margin-top: 10px; background: transparent;")
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
        self.lbl_chat_title.setStyleSheet("font-size: 15px; font-weight: bold; color: #ffffff; background: transparent;")
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
        self.input_container.setStyleSheet("background-color: #141923; border-top: 1px solid #222938; padding: 14px 22px;")
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

        self.refresh_sessions_list_ui()
        self.render_current_session_messages()

    def load_default_or_last_workflow(self):
        sample_path = os.path.join(current_dir, "sample_agent.json")
        if os.path.exists(sample_path):
            try:
                with open(sample_path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                self.workflow_dict = content
                self.workflow_path = sample_path
                self.compile_and_update_agent(content)
            except Exception:
                pass

    def compile_and_update_agent(self, workflow_dict: dict):
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
            agent_name = workflow_dict.get("metadata", {}).get("agent_name", "Local Agent")
            agent_desc = workflow_dict.get("metadata", {}).get("description", "설명 없음")
            self.lbl_agent_name.setText(agent_name)
            self.lbl_agent_desc.setText(agent_desc)
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

        self.sessions = load_sessions()
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
        delete_session(session_id)
        self.sessions = load_sessions()
        if self.current_session_id == session_id:
            self.current_session_id = self.sessions[0]["id"] if self.sessions else None
            self.is_new_chat_mode = False
        self.refresh_sessions_list_ui()
        self.render_current_session_messages()

    def on_open_settings(self):
        dialog = SettingsDialog(self, self.workflow_dict, self.workflow_path)
        if dialog.exec() == QDialog.Accepted:
            self.workflow_dict = dialog.workflow_dict
            self.workflow_path = dialog.workflow_path
            if self.workflow_dict:
                success, err = self.compile_and_update_agent(self.workflow_dict)
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

        # 세션이 0개이고 '새로운 대화' 모드가 아닐 때 입력창 숨김
        self.input_container.setVisible(is_active)

        if not self.current_session_id:
            self.lbl_chat_title.setText("새로운 대화")
            if self.is_new_chat_mode:
                placeholder = QLabel("새로운 대화를 시작해주세요.\n아래 입력창에 메시지를 입력하여 대화를 시작할 수 있습니다.")
            else:
                placeholder = QLabel("대화 목록이 없습니다.\n상단의 [새로운 대화] 버튼을 눌러 대화를 시작하세요.")
            placeholder.setAlignment(Qt.AlignCenter)
            placeholder.setStyleSheet("color: #7a889b; font-size: 14px; padding: 60px; line-height: 1.6; background: transparent;")
            self.chat_messages_layout.insertWidget(0, placeholder)
            return

        curr = next((s for s in self.sessions if s["id"] == self.current_session_id), None)
        if not curr:
            self.current_session_id = None
            self.render_current_session_messages()
            return

        self.lbl_chat_title.setText(curr["title"])

        if not curr.get("messages"):
            placeholder = QLabel("에이전트에게 질문이나 메시지를 입력하세요.")
            placeholder.setAlignment(Qt.AlignCenter)
            placeholder.setStyleSheet("color: #7a889b; font-size: 13px; padding: 40px; background: transparent;")
            self.chat_messages_layout.insertWidget(0, placeholder)
            return

        for msg in curr.get("messages", []):
            role = msg.get("role", "user")
            content = msg.get("content", "")
            logs = msg.get("logs", [])
            self.add_message_bubble(role, content, logs)

        QApplication.processEvents()
        self.chat_scroll.verticalScrollBar().setValue(
            self.chat_scroll.verticalScrollBar().maximum()
        )

    def add_message_bubble(self, role: str, text: str, logs: list = None):
        bubble_frame = QFrame()
        is_user = (role == "user")
        
        b_layout = QVBoxLayout(bubble_frame)
        b_layout.setContentsMargins(14, 10, 14, 10)
        b_layout.setSpacing(6)

        if is_user:
            bubble_frame.setStyleSheet("""
                QFrame {
                    background-color: #1e2e45;
                    border: 1px solid #2d4263;
                    border-radius: 10px;
                    margin-left: 60px;
                }
            """)
            lbl_role = QLabel("나 (User)")
            lbl_role.setStyleSheet("color: #79a8f2; font-size: 11px; font-weight: bold; background: transparent;")
            b_layout.addWidget(lbl_role)
        else:
            bubble_frame.setStyleSheet("""
                QFrame {
                    background-color: #161e2b;
                    border: 1px solid #243044;
                    border-radius: 10px;
                    margin-right: 60px;
                }
            """)
            lbl_role = QLabel("에이전트 (Agent)")
            lbl_role.setStyleSheet("color: #4cd7f6; font-size: 11px; font-weight: bold; background: transparent;")
            b_layout.addWidget(lbl_role)

            if logs:
                thought_widget = ThoughtLogToggleWidget(logs, is_live=False)
                b_layout.addWidget(thought_widget)

        lbl_text = QLabel(text)
        lbl_text.setWordWrap(True)
        lbl_text.setTextInteractionFlags(Qt.TextSelectableByMouse)
        lbl_text.setStyleSheet("color: #ffffff; font-size: 13px; line-height: 1.45; background: transparent;")
        b_layout.addWidget(lbl_text)

        idx = max(0, self.chat_messages_layout.count() - 1)
        self.chat_messages_layout.insertWidget(idx, bubble_frame)

    def on_submit_or_stop(self):
        # 1. 만약 현재 실행 중이라면 정지(Stop) 수행
        if self.current_worker and self.current_worker.isRunning():
            self.current_worker.stop()
            self.set_executing_state(False)
            return

        # 2. 전송(Send) 수행
        text = self.txt_input.text().strip()
        if not text:
            return

        if not self.compiled_graph:
            QMessageBox.warning(self, "에이전트 미로드", "실행 가능한 에이전트가 없습니다.\n좌측 하단 [에이전트 로드 / 설정]에서 워크플로우를 불러와주세요.")
            return

        # 새 세션 모드였다면 실제 세션 생성
        if not self.current_session_id or self.is_new_chat_mode:
            title = text[:18]
            new_s = create_new_session(title=title)
            self.current_session_id = new_s["id"]
            self.is_new_chat_mode = False
            self.sessions = load_sessions()
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

        # 1. 사용자 메시지 버블 추가
        self.add_message_bubble("user", text)
        curr_session["messages"].append({
            "role": "user",
            "content": text,
            "created_at": datetime.now().isoformat()
        })

        # 2. 점(...) 애니메이션 말풍선 표시 (최초 로그 전까지 유지)
        self.loading_bubble = PureDotsAnimationWidget()
        idx = max(0, self.chat_messages_layout.count() - 1)
        self.chat_messages_layout.insertWidget(idx, self.loading_bubble)

        QApplication.processEvents()
        self.chat_scroll.verticalScrollBar().setValue(
            self.chat_scroll.verticalScrollBar().maximum()
        )

        # 3. 비동기 Worker 실행
        history_messages = curr_session["messages"][:-1]
        target_sid = self.current_session_id
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

    @Slot(str, str)
    def on_agent_step_log(self, session_id: str, log_message: str):
        if self.current_session_id != session_id:
            return

        # 최초 로그 도착 시 점(...) 애니메이션 말풍선 제거
        if self.loading_bubble:
            self.loading_bubble.stop()
            self.loading_bubble.deleteLater()
            self.loading_bubble = None

        # 실시간 사고과정 로그 위젯 생성 또는 로그 추가
        if not self.live_thought_widget:
            bubble_frame = QFrame()
            bubble_frame.setStyleSheet("""
                QFrame {
                    background-color: #161e2b;
                    border: 1px solid #243044;
                    border-radius: 10px;
                    margin-right: 60px;
                }
            """)
            b_layout = QVBoxLayout(bubble_frame)
            b_layout.setContentsMargins(14, 10, 14, 10)
            b_layout.setSpacing(6)

            lbl_role = QLabel("에이전트 (Agent)")
            lbl_role.setStyleSheet("color: #4cd7f6; font-size: 11px; font-weight: bold; background: transparent;")
            b_layout.addWidget(lbl_role)

            self.live_thought_widget = ThoughtLogToggleWidget([log_message], is_live=True)
            b_layout.addWidget(self.live_thought_widget)

            self.live_response_label = QLabel("")
            self.live_response_label.setWordWrap(True)
            self.live_response_label.setTextInteractionFlags(Qt.TextSelectableByMouse)
            self.live_response_label.setStyleSheet("color: #ffffff; font-size: 13px; line-height: 1.45; background: transparent;")
            b_layout.addWidget(self.live_response_label)

            idx = max(0, self.chat_messages_layout.count() - 1)
            self.chat_messages_layout.insertWidget(idx, bubble_frame)
        else:
            self.live_thought_widget.append_log(log_message)

        QApplication.processEvents()
        self.chat_scroll.verticalScrollBar().setValue(
            self.chat_scroll.verticalScrollBar().maximum()
        )

    @Slot(str, str, list)
    def on_agent_finished(self, session_id: str, output: str, logs: list):
        all_sessions = load_sessions()
        target_s = next((s for s in all_sessions if s["id"] == session_id), None)
        if target_s:
            target_s["messages"].append({
                "role": "assistant",
                "content": output,
                "logs": logs,
                "created_at": datetime.now().isoformat()
            })
            update_session_messages(target_s["id"], target_s["messages"], logs=logs, title=target_s["title"])

        self.sessions = load_sessions()

        if self.current_session_id == session_id:
            if self.loading_bubble:
                self.loading_bubble.stop()
                self.loading_bubble.deleteLater()
                self.loading_bubble = None

            if self.live_thought_widget:
                # 실시간 사고과정 로그 위젯을 완료 상태로 접음
                self.live_thought_widget.collapse()
                self.live_response_label.setText(output)
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
        all_sessions = load_sessions()
        target_s = next((s for s in all_sessions if s["id"] == session_id), None)
        if target_s:
            target_s["messages"].append({
                "role": "assistant",
                "content": f"오류로 인해 응답을 생성하지 못했습니다:\n{err_msg}",
                "logs": [f"Error: {err_msg}"],
                "created_at": datetime.now().isoformat()
            })
            update_session_messages(target_s["id"], target_s["messages"], title=target_s["title"])

        self.sessions = load_sessions()

        if self.current_session_id == session_id:
            if self.loading_bubble:
                self.loading_bubble.stop()
                self.loading_bubble.deleteLater()
                self.loading_bubble = None

            if self.live_thought_widget:
                self.live_thought_widget.collapse()
                self.live_response_label.setText(f"오류 발생:\n{err_msg}")
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
