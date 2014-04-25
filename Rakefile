# Download the shapefile
file "US_AtlasHCB_StateTerr_Gen01.zip" do
  system %[curl -O http://publications.newberry.org/ahcbp/downloads/gis/US_AtlasHCB_StateTerr_Gen01.zip]
end

# Unzip the shapefile
directory "US_AtlasHCB_StateTerr_Gen01" => ["US_AtlasHCB_StateTerr_Gen01.zip"] do
  system %[unzip US_AtlasHCB_StateTerr_Gen01.zip]
end


file "us.json" => ["US_AtlasHCB_StateTerr_Gen01"] do
  system %[topojson --id-property ID -p -o us.json states=US_AtlasHCB_StateTerr_Gen01/US_HistStateTerr_Gen01_Shapefile/US_HistStateTerr_Gen01.shp]
end

task :data => ["us.json"]

task :default => :push

desc "Push the project to lincolnmullen.com"
task :push do

  ssh_port       = "22"
  ssh_user       = "reclaim"
  rsync_delete   = true
  rsync_options  = "--progress --stats -avze"
  public_dir     = "." 
  document_root  = "~/public_html/lincolnmullen.com/projects/us-boundaries"
  
  exclude = ""
  if File.exists?('./rsync-exclude')
    exclude = "--exclude-from '#{File.expand_path('./rsync-exclude')}'"
  end

  system("rsync #{rsync_options} 'ssh -p #{ssh_port}' #{exclude} #{"--delete" unless rsync_delete == false} #{public_dir}/ #{ssh_user}:#{document_root}")

end

require "rake/clean"

CLEAN.include("US_AtlasHCB_StateTerr_Gen01.zip", 
              "US_AtlasHCB_StateTerr_Gen01")

CLOBBER.include("us.json")

