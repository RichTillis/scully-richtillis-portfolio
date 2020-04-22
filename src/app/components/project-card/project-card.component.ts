import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {
  // @Input() logoLocation: string;
  // @Input() title: string;
  // @Input() socialLinks: [{ latitude: number; longitude: number }];
  // @Input() techBadges: [{ latitude: number; longitude: number }];

  constructor() { }

  ngOnInit(): void {
  }

}
