import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { BlocklyComponent } from './blockly/blockly.component';
import { ConfigService } from './core/services/config.service';
import { BlocklyService } from './blockly/service/blockly.service';
import { ArduinoCliService } from './core/services/arduino-cli.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CloudComponent } from './cloud/cloud.component'
import { SerialService } from './core/services/serial.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(BlocklyComponent) blocklyComponent;

  code: string = '';

  get boardList() {
    return this.configService.boardList
  }

  get serialList() {
    return this.serialService.serialList
  }

  serialSelected = '';
  boardSelected = '';

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private configService: ConfigService,
    private blocklyService: BlocklyService,
    private arduinoCli: ArduinoCliService,
    private modal: NzModalService,
    private serialService: SerialService
  ) {
    this.translate.setDefaultLang('en');
    // console.log('APP_CONFIG', APP_CONFIG);
    if (electronService.isElectron) {
      console.log('Run in electron');
      // console.log(process.env);
      // console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      // console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit(): void {
    this.configService.init();

    this.blocklyService.loaded.subscribe(state => {
      if (state) {
        // console.log('blocklyService loaded');
      }
    })
    this.configService.loaded.subscribe(state => {
      if (state) {
        // console.log('configService loaded');
        this.serialSelected = this.configService.config.serial;
        if (this.configService.config.board != null)
          this.boardSelected = this.configService.config.board.name;
      }
    })
  }

  ngAfterViewInit(): void {
    this.getSerialPortList()
  }

  codeChange(code) {
    this.code = code
  }

  showShell = false;
  check() {
    this.showShell = true;
    this.arduinoCli.build(this.code)
  }

  upload() {
    this.showShell = true;
    this.arduinoCli.upload(this.code)
  }

  newFile() {
    this.blocklyComponent.loadTempData()
  }

  saveFile() {
    this.electronService.saveFile(this.blocklyComponent.getXml())
  }

  openFile() {
    this.electronService.openFile().then(fileContent => {
      this.blocklyComponent.loadXml(fileContent);
    })
  }

  showCode = false;
  openCode(): void {
    this.showCode = !this.showCode;
  }

  showMonitor = false;
  openMonitor() {
    this.showMonitor = !this.showMonitor
  }

  showSetting = false;
  openSetting() {
    this.showSetting = !this.showSetting
  }

  boardChange(e) {
    this.configService.selectBoard(e);
    setTimeout(() => {
      this.blocklyComponent.reinit();
    }, 1000);
  }

  serialChange(e) {
    this.configService.selectSerial(e)
  }

  async getSerialPortList() {
    await this.serialService.getSerialPortList()
  }

  willClose = false
  close(e) {
    switch (e) {
      case 'code':
        this.willClose = true
        setTimeout(() => {
          this.showCode = false
          this.willClose = false
        }, 600);
        break;
      case 'setting':
        this.willClose = true
        setTimeout(() => {
          this.showSetting = false
          this.willClose = false
        }, 600);
        break;
      case 'shell':
        this.willClose = true
        setTimeout(() => {
          this.showShell = false
          this.willClose = false
        }, 600);
        break;
      case 'monitor':
        this.willClose = true
        setTimeout(() => {
          this.showMonitor = false
          this.willClose = false
        }, 600);
        break;
      default:
        break;
    }
  }

  openCloud() {
    this.modal.create({
      nzTitle: '云资源',
      nzContent: CloudComponent,
      nzWidth: '60vw',
      nzFooter: null
    })
  }

}
