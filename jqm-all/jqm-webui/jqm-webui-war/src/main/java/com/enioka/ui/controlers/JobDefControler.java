package com.enioka.ui.controlers;

import java.io.Serializable;
import java.util.Calendar;

import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.context.FacesContext;
import javax.faces.model.ListDataModel;
import javax.persistence.EntityManager;

import org.primefaces.event.SelectEvent;
import org.primefaces.event.UnselectEvent;
import org.primefaces.model.SelectableDataModel;

import com.enioka.jqm.api.JobRequest;
import com.enioka.jqm.api.JqmClientFactory;
import com.enioka.jqm.jpamodel.History;
import com.enioka.jqm.jpamodel.JobDef;
import com.enioka.jqm.jpamodel.State;
import com.enioka.jqm.test.helpers.CreationTools;
import com.enioka.jqm.test.helpers.TestHelpers;
import com.enioka.ui.helpers.Db;

@ManagedBean(eager = true)
@SessionScoped
public class JobDefControler extends ListDataModel<JobDef> implements Serializable, SelectableDataModel<JobDef>
{
    private static final long serialVersionUID = -608970776489109835L;

    EntityManager em = null;

    private JobDef selected = null;
    private String userName = "user";

    public JobDefControler()
    {
        em = Db.getEm();

        if (em.createQuery("SELECT COUNT(n) FROM Node n", Long.class).getSingleResult().equals(0l))
        {
            TestHelpers.createLocalNode(em);
            JobDef jd1 = CreationTools.createJobDef(null, true, "com.enioka.jqm.tests.App", null,
                    "jqm-tests/jqm-test-fibo/target/test.jar", TestHelpers.qVip, 42, "Fibo", null, "Franquin", "ModuleMachin", "other1",
                    "other2", false, em);
            CreationTools.createJobDef(null, true, "com.enioka.jqm.tests.App", null, "jqm-tests/jqm-test-fibo/target/test.jar",
                    TestHelpers.qVip, 42, "Fibo2", null, "Franquin", "ModuleMachin", "other1", "other2", false, em);
            CreationTools.createJobDef(null, true, "com.enioka.jqm.tests.App", null, "jqm-tests/jqm-test-fibo/target/test.jar",
                    TestHelpers.qVip, 42, "Fibo3", null, "Franquin", "ModuleMachin", "other1", "other2", false, em);
            CreationTools.createJobDef(null, true, "com.enioka.jqm.tests.App", null, "jqm-tests/jqm-test-fibo/target/test.jar",
                    TestHelpers.qVip, 42, "Fibo4", null, "Franquin", "ModuleMachin", "other1", "other2", false, em);
            CreationTools.createJobDef(null, true, "com.enioka.jqm.tests.App", null, "jqm-tests/jqm-test-fibo/target/test.jar",
                    TestHelpers.qVip, 42, "Fibo5", null, "Franquin", "ModuleMachin", "other1", "other2", false, em);

            em.getTransaction().begin();
            History h = new History();
            h.setJd(jd1);
            h.setQueue(TestHelpers.qVip);
            h.setId(12);
            h.setEnqueueDate(Calendar.getInstance());
            h.setExecutionDate(Calendar.getInstance());
            h.setEndDate(Calendar.getInstance());
            h.setUserName("houba");
            h.setNode(TestHelpers.node);
            h.setStatus(State.ENDED);
            em.persist(h);
            em.getTransaction().commit();
        }
    }

    public ListDataModel<JobDef> getJobs()
    {
        this.setWrappedData(em.createQuery("SELECT j FROM JobDef j", JobDef.class).getResultList());
        return this;
    }

    public String enqueue()
    {
        JobRequest jr = new JobRequest(this.selected.getApplicationName(), this.userName);
        int i = JqmClientFactory.getClient().enqueue(jr);

        FacesMessage msg = new FacesMessage("Enqueue done", "request number " + i);
        FacesContext.getCurrentInstance().addMessage(null, msg);

        return ((Integer) i).toString();
    }

    public void setSelectedJob(JobDef job)
    {
        selected = job;
    }

    public JobDef getSelectedJob()
    {
        return selected;
    }

    public String getUserName()
    {
        return userName;
    }

    public void setUserName(String userName)
    {
        this.userName = userName;
    }

    public void onRowSelect(SelectEvent event)
    {
        FacesMessage msg = new FacesMessage("JD Selected", ((JobDef) event.getObject()).getApplicationName());
        FacesContext.getCurrentInstance().addMessage(null, msg);
    }

    public void onRowUnselect(UnselectEvent event)
    {
        FacesMessage msg = new FacesMessage("JD Unselected", ((JobDef) event.getObject()).getApplicationName());
        FacesContext.getCurrentInstance().addMessage(null, msg);
    }

    @Override
    public Object getRowKey(JobDef object)
    {
        return object.getId();
    }

    @Override
    public JobDef getRowData(String rowKey)
    {
        EntityManager em = Db.getEm();
        JobDef jd = em.find(JobDef.class, Integer.parseInt(rowKey));
        em.close();
        return jd;
    }
}
